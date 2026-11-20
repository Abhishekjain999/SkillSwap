import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import { config } from './config.js';

const execFileAsync = promisify(execFile);

/**
 * DockerRunner handles running isolated Docker containers with resource and security constraints.
 */
export class DockerRunner {
  constructor(customConfig = {}) {
    this.cfg = { ...config, ...customConfig };
    this.activeExecutions = 0;
    this.waitQueue = [];
  }

  /**
   * Check if Docker is installed and the Docker daemon is responding.
   */
  async checkDockerAvailable() {
    try {
      await execFileAsync(this.cfg.dockerCmd, ['info'], { timeout: 4000 });
      return { available: true };
    } catch (err) {
      const isNotFound = err.code === 'ENOENT';
      const msg = isNotFound
        ? `Docker CLI ('${this.cfg.dockerCmd}') is not installed or not in system PATH.`
        : `Docker daemon is not running or unreachable: ${err.message}`;
      return { available: false, error: msg };
    }
  }

  /**
   * Normalizes a host directory path for Docker volume mounting.
   * On Windows, converts backslashes to forward slashes.
   */
  formatVolumePath(hostPath) {
    let p = hostPath.replace(/\\/g, '/');
    // Ensure Windows drive letters (e.g. C:/) work cleanly with Docker mounts
    return p;
  }

  /**
   * Acquire a concurrency slot or queue the request.
   */
  async acquireSlot() {
    if (this.activeExecutions < this.cfg.maxConcurrentExecutions) {
      this.activeExecutions++;
      return;
    }

    return new Promise((resolve, reject) => {
      if (this.waitQueue.length >= 20) {
        return reject(new Error('Server code execution queue is full. Please try again shortly.'));
      }
      this.waitQueue.push(resolve);
    });
  }

  /**
   * Release a concurrency slot.
   */
  releaseSlot() {
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      next();
    } else {
      this.activeExecutions = Math.max(0, this.activeExecutions - 1);
    }
  }

  /**
   * Run a command inside an isolated Docker container.
   *
   * @param {Object} options
   * @param {string} options.image - Docker image to use
   * @param {string} options.workspaceDir - Host directory to mount
   * @param {string[]} options.command - Command and arguments to execute
   * @param {string} [options.stdin] - Standard input string to pipe
   * @param {number} [options.timeoutMs] - Custom timeout in ms
   * @param {boolean} [options.readOnlyWorkspace=false] - Mount workspace as read-only
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, executionTime: number, status: string }>}
   */
  async runContainer({
    image,
    workspaceDir,
    command,
    stdin = '',
    timeoutMs = this.cfg.timeoutMs,
    readOnlyWorkspace = false
  }) {
    await this.acquireSlot();

    const containerId = `skillswap-exec-${crypto.randomBytes(6).toString('hex')}`;
    const formattedHostDir = this.formatVolumePath(workspaceDir);
    const volumeMount = `${formattedHostDir}:/workspace:${readOnlyWorkspace ? 'ro' : 'rw'}`;

    // Construct security and isolation flags
    const dockerArgs = [
      'run',
      '--name', containerId,
      '--rm',                             // Remove container when it exits
      '--network', this.cfg.network,      // Disable network access (default: none)
      '--memory', this.cfg.memoryLimit,   // Hard memory limit
      '--memory-swap', this.cfg.memoryLimit, // Disable swap beyond memory limit
      '--cpus', this.cfg.cpuLimit,        // Limit CPU allocation
      '--pids-limit', String(this.cfg.pidsLimit), // Prevent fork bombs
      '-v', volumeMount,                  // Mount isolated workspace only
      '-w', '/workspace',                 // Set working directory
      '-i',                               // Interactive (accept stdin)
    ];

    // Add tmpfs for temporary scratch files if read-only root fs is configured
    if (this.cfg.readOnlyRootFs) {
      dockerArgs.push('--read-only');
      dockerArgs.push('--tmpfs', '/tmp:rw,noexec,nosuid,size=32m');
    }

    // Pass target image and command array (no shell string interpolation)
    dockerArgs.push(image);
    dockerArgs.push(...command);

    const startTime = Date.now();
    let isTimedOut = false;
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let stdoutTruncated = false;
    let stderrTruncated = false;
    let timeoutTimer = null;

    try {
      const result = await new Promise((resolve) => {
        let child;
        try {
          child = spawn(this.cfg.dockerCmd, dockerArgs, {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
          });
        } catch (spawnError) {
          return resolve({
            stdout: '',
            stderr: `Failed to spawn Docker process: ${spawnError.message}`,
            exitCode: -1,
            executionTime: Date.now() - startTime,
            status: 'system_error'
          });
        }

        // Set execution timeout
        timeoutTimer = setTimeout(async () => {
          isTimedOut = true;
          try {
            // Forcefully terminate the Docker container by name
            await execFileAsync(this.cfg.dockerCmd, ['kill', containerId]).catch(() => {});
          } catch (_) {}
          try {
            child.kill('SIGKILL');
          } catch (_) {}
        }, timeoutMs);

        // Pipe stdin
        if (child.stdin) {
          if (stdin && typeof stdin === 'string') {
            child.stdin.write(stdin);
          }
          child.stdin.end();
        }

        // Collect stdout with buffer limit
        child.stdout.on('data', (chunk) => {
          if (stdoutBuffer.length < this.cfg.maxOutputBytes) {
            stdoutBuffer += chunk.toString('utf-8');
            if (stdoutBuffer.length >= this.cfg.maxOutputBytes) {
              stdoutTruncated = true;
              stdoutBuffer = stdoutBuffer.slice(0, this.cfg.maxOutputBytes);
            }
          }
        });

        // Collect stderr with buffer limit
        child.stderr.on('data', (chunk) => {
          if (stderrBuffer.length < this.cfg.maxOutputBytes) {
            stderrBuffer += chunk.toString('utf-8');
            if (stderrBuffer.length >= this.cfg.maxOutputBytes) {
              stderrTruncated = true;
              stderrBuffer = stderrBuffer.slice(0, this.cfg.maxOutputBytes);
            }
          }
        });

        // Handle process errors (e.g. docker binary not found)
        child.on('error', (err) => {
          clearTimeout(timeoutTimer);
          const isNotFound = err.code === 'ENOENT';
          const errMsg = isNotFound
            ? `Docker CLI ('${this.cfg.dockerCmd}') was not found. Please install Docker or ensure it is in the system PATH.`
            : `Docker execution error: ${err.message}`;

          resolve({
            stdout: stdoutBuffer,
            stderr: errMsg,
            exitCode: -1,
            executionTime: Date.now() - startTime,
            status: 'system_error'
          });
        });

        // Handle process exit
        child.on('close', (code) => {
          clearTimeout(timeoutTimer);
          const executionTime = Date.now() - startTime;

          if (stdoutTruncated) {
            stdoutBuffer += `\n[Output truncated: exceeded ${Math.round(this.cfg.maxOutputBytes / 1024)} KB limit]`;
          }
          if (stderrTruncated) {
            stderrBuffer += `\n[Output truncated: exceeded ${Math.round(this.cfg.maxOutputBytes / 1024)} KB limit]`;
          }

          if (isTimedOut) {
            return resolve({
              stdout: stdoutBuffer,
              stderr: stderrBuffer + (stderrBuffer ? '\n' : '') + `Execution timed out after ${timeoutMs / 1000} seconds.`,
              exitCode: 124, // Standard timeout exit code
              executionTime,
              status: 'timeout_error'
            });
          }

          // Check if docker reported daemon errors or image errors
          if (code !== 0 && (stderrBuffer.includes('Cannot connect to the Docker daemon') || stderrBuffer.includes('docker: command not found'))) {
            return resolve({
              stdout: stdoutBuffer,
              stderr: stderrBuffer,
              exitCode: code ?? -1,
              executionTime,
              status: 'system_error'
            });
          }

          return resolve({
            stdout: stdoutBuffer,
            stderr: stderrBuffer,
            exitCode: code ?? 0,
            executionTime,
            status: code === 0 ? 'success' : 'runtime_error'
          });
        });
      });

      return result;
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.releaseSlot();

      // Ensure container cleanup even if something went wrong
      try {
        await execFileAsync(this.cfg.dockerCmd, ['rm', '-f', containerId], { timeout: 3000 }).catch(() => {});
      } catch (_) {}
    }
  }
}

export const defaultDockerRunner = new DockerRunner();
