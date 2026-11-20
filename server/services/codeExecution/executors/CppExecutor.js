import { BaseExecutor } from './BaseExecutor.js';
import { config } from '../config.js';

/**
 * C++ Language Executor (GCC / G++ C++17)
 */
export class CppExecutor extends BaseExecutor {
  constructor() {
    super({
      language: 'cpp',
      image: config.images.cpp,
      sourceFileName: 'main.cpp',
    });
    this.binaryName = 'solution';
  }

  /**
   * Compile the C++ source file using g++.
   */
  async compile(workspaceDir, dockerRunner) {
    const result = await dockerRunner.runContainer({
      image: this.image,
      workspaceDir,
      command: ['g++', '-O2', '-std=c++17', '-Wall', this.sourceFileName, '-o', this.binaryName],
      timeoutMs: Math.min(10000, config.timeoutMs * 2),
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
    return [`./${this.binaryName}`];
  }
}
