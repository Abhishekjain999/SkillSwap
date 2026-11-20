import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { defaultDockerRunner } from './DockerRunner.js';
import { defaultExecutorRegistry } from './executors/ExecutorRegistry.js';
import { config } from './config.js';

/**
 * ExecutionService orchestrates the end-to-end execution lifecycle.
 */
export class ExecutionService {
  constructor({
    dockerRunner = defaultDockerRunner,
    registry = defaultExecutorRegistry,
    customConfig = {}
  } = {}) {
    this.runner = dockerRunner;
    this.registry = registry;
    this.cfg = { ...config, ...customConfig };
  }

  /**
   * Validates the execution request payload.
   *
   * @param {Object} payload
   */
  validatePayload({ language, code, stdin = '' }) {
    if (!language || typeof language !== 'string') {
      const err = new Error('Field "language" is required and must be a string.');
      err.statusCode = 400;
      throw err;
    }

    if (!this.registry.isSupported(language)) {
      const supported = this.registry.getSupportedLanguages().map(l => l.id).join(', ');
      const err = new Error(`Unsupported programming language: "${language}". Supported: ${supported}`);
      err.statusCode = 400;
      throw err;
    }

    if (code === undefined || code === null || typeof code !== 'string' || !code.trim()) {
      const err = new Error('Field "code" cannot be empty.');
      err.statusCode = 400;
      throw err;
    }

    if (Buffer.byteLength(code, 'utf-8') > this.cfg.maxCodeSize) {
      const limitKb = Math.round(this.cfg.maxCodeSize / 1024);
      const err = new Error(`Code size exceeds the maximum limit of ${limitKb} KB.`);
      err.statusCode = 400;
      throw err;
    }

    if (stdin && Buffer.byteLength(stdin, 'utf-8') > this.cfg.maxStdinSize) {
      const limitKb = Math.round(this.cfg.maxStdinSize / 1024);
      const err = new Error(`Standard input size exceeds the maximum limit of ${limitKb} KB.`);
      err.statusCode = 400;
      throw err;
    }
  }

  /**
   * Executes source code inside an isolated Docker container.
   *
   * @param {Object} params
   * @param {string} params.language - Language ID (e.g. 'python', 'java', 'cpp', 'javascript')
   * @param {string} params.code - Source code to execute
   * @param {string} [params.stdin] - Standard input
   * @param {string} [params.userId] - Optional ID of requesting user for logging
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, executionTime: number, status: string }>}
   */
  async execute({ language, code, stdin = '', userId = 'anonymous' }) {
    this.validatePayload({ language, code, stdin });

    const executionId = crypto.randomBytes(8).toString('hex');
    const executor = this.registry.getExecutor(language);
    const canonicalLang = executor.getLanguage();

    console.log(`[CodeExecution] [${executionId}] Request received: lang=${canonicalLang}, user=${userId}, codeBytes=${code.length}`);

    // Check Docker daemon availability before provisioning workspace
    const dockerStatus = await this.runner.checkDockerAvailable();
    if (!dockerStatus.available) {
      console.warn(`[CodeExecution] [${executionId}] Docker unavailable: ${dockerStatus.error}`);
      return {
        stdout: '',
        stderr: `Docker daemon unavailable: ${dockerStatus.error}`,
        exitCode: -1,
        executionTime: 0,
        status: 'system_error',
      };
    }

    // Ensure base temp directory exists
    await fs.mkdir(this.cfg.tempDir, { recursive: true }).catch(() => {});

    // Create unique temporary workspace directory
    const workspaceDir = await fs.mkdtemp(path.join(this.cfg.tempDir, `exec-${executionId}-`));

    const totalStartTime = Date.now();

    try {
      // 1. Write source file to workspace
      await executor.prepareWorkspace(workspaceDir, code);

      // 2. Compilation step (for compiled languages like C++, Java)
      const compileResult = await executor.compile(workspaceDir, this.runner);
      if (compileResult && !compileResult.success) {
        const totalDuration = Date.now() - totalStartTime;
        console.log(`[CodeExecution] [${executionId}] Compilation failed in ${compileResult.executionTime}ms`);
        return {
          stdout: compileResult.stdout || '',
          stderr: compileResult.stderr || 'Compilation error',
          exitCode: compileResult.exitCode || 1,
          executionTime: totalDuration,
          status: 'compilation_error',
        };
      }

      // 3. Execution step inside Docker container
      const execResult = await this.runner.runContainer({
        image: executor.getImage(),
        workspaceDir,
        command: executor.getExecuteCommand(),
        stdin,
        timeoutMs: this.cfg.timeoutMs,
        readOnlyWorkspace: false,
        ...executor.getExecuteOptions(),
      });

      const totalDuration = Date.now() - totalStartTime;
      console.log(`[CodeExecution] [${executionId}] Execution completed: status=${execResult.status}, exitCode=${execResult.exitCode}, time=${totalDuration}ms`);

      return {
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        executionTime: totalDuration,
        status: execResult.status,
      };
    } catch (err) {
      const totalDuration = Date.now() - totalStartTime;
      console.error(`[CodeExecution] [${executionId}] Internal error: ${err.message}`);
      return {
        stdout: '',
        stderr: `Execution engine error: ${err.message}`,
        exitCode: -1,
        executionTime: totalDuration,
        status: 'system_error',
      };
    } finally {
      // 4. Guaranteed cleanup of temporary workspace
      try {
        await fs.rm(workspaceDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.warn(`[CodeExecution] [${executionId}] Workspace cleanup failed: ${cleanupErr.message}`);
      }
    }
  }

  /**
   * Get list of supported languages and system metadata.
   */
  getSupportedLanguages() {
    return this.registry.getSupportedLanguages();
  }
}

export const defaultExecutionService = new ExecutionService();
