import fs from 'fs/promises';
import path from 'path';
import { BaseExecutor } from './BaseExecutor.js';
import { config } from '../config.js';

/**
 * Java Language Executor (OpenJDK 21)
 */
export class JavaExecutor extends BaseExecutor {
  constructor() {
    super({
      language: 'java',
      image: config.images.java,
      sourceFileName: 'Main.java',
    });
    this.currentClassName = 'Main';
  }

  /**
   * Detects the public class name if explicitly defined by the user,
   * otherwise defaults to 'Main'.
   */
  detectClassName(code) {
    const match = code.match(/public\s+(?:final\s+)?class\s+([A-Za-z0-9_]+)/);
    return match ? match[1] : 'Main';
  }

  async prepareWorkspace(workspaceDir, code) {
    this.currentClassName = this.detectClassName(code);
    this.sourceFileName = `${this.currentClassName}.java`;
    const filePath = path.join(workspaceDir, this.sourceFileName);
    await fs.writeFile(filePath, code, 'utf-8');
    return filePath;
  }

  /**
   * Compile the Java source file using javac.
   */
  async compile(workspaceDir, dockerRunner) {
    const result = await dockerRunner.runContainer({
      image: this.image,
      workspaceDir,
      command: ['javac', '-encoding', 'UTF-8', this.sourceFileName],
      timeoutMs: Math.min(10000, config.timeoutMs * 2), // Allow compilation up to 10s
      readOnlyWorkspace: false,
    });

    if (result.exitCode !== 0) {
      return {
        success: false,
        stdout: result.stdout,
        stderr: result.stderr || 'Compilation failed',
        exitCode: result.exitCode,
        executionTime: result.executionTime,
      };
    }

    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
      executionTime: result.executionTime,
    };
  }

  getExecuteCommand() {
    // -Xmx128m limits heap inside JVM, -Xss512k limits stack
    return ['java', '-Xmx128m', '-Xss512k', this.currentClassName];
  }
}
