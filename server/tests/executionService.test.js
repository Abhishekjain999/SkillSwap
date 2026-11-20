import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import { ExecutionService } from '../services/codeExecution/ExecutionService.js';
import { ExecutorRegistry } from '../services/codeExecution/executors/ExecutorRegistry.js';

/**
 * Mock Docker Runner for deterministic unit testing of execution service.
 */
class MockDockerRunner {
  constructor({
    isDockerAvailable = true,
    dockerError = 'Docker daemon is not responding',
    mockExecResult = null,
    mockCompileResult = null,
  } = {}) {
    this.isDockerAvailable = isDockerAvailable;
    this.dockerError = dockerError;
    this.mockExecResult = mockExecResult || {
      stdout: 'Default mock stdout\n',
      stderr: '',
      exitCode: 0,
      executionTime: 45,
      status: 'success'
    };
    this.mockCompileResult = mockCompileResult;
    this.executedContainers = [];
    this.lastWorkspaceDir = null;
  }

  async checkDockerAvailable() {
    return this.isDockerAvailable
      ? { available: true }
      : { available: false, error: this.dockerError };
  }

  async runContainer(opts) {
    this.executedContainers.push(opts);
    this.lastWorkspaceDir = opts.workspaceDir;

    // Check if this is a compilation command
    const isCompile = opts.command.some(c => c === 'javac' || c === 'g++');
    if (isCompile && this.mockCompileResult) {
      return this.mockCompileResult;
    }

    return this.mockExecResult;
  }
}

describe('ExecutionService', () => {
  const registry = new ExecutorRegistry();

  describe('Input Validation', () => {
    const service = new ExecutionService({ registry });

    it('should reject missing language', async () => {
      await assert.rejects(
        async () => await service.execute({ language: '', code: 'print(1)' }),
        (err) => err.statusCode === 400 && err.message.includes('language')
      );
    });

    it('should reject unsupported language', async () => {
      await assert.rejects(
        async () => await service.execute({ language: 'cobol', code: 'DISPLAY "HI"' }),
        (err) => err.statusCode === 400 && err.message.includes('Unsupported')
      );
    });

    it('should reject empty or whitespace-only code', async () => {
      await assert.rejects(
        async () => await service.execute({ language: 'python', code: '   \n  ' }),
        (err) => err.statusCode === 400 && err.message.includes('empty')
      );
    });

    it('should reject code exceeding size limit', async () => {
      const hugeCode = 'x = 1\n'.repeat(30000); // > 100 KB
      await assert.rejects(
        async () => await service.execute({ language: 'python', code: hugeCode }),
        (err) => err.statusCode === 400 && err.message.includes('exceeds the maximum limit')
      );
    });
  });

  describe('Execution Scenarios', () => {
    it('should successfully execute Python code', async () => {
      const mockRunner = new MockDockerRunner({
        mockExecResult: {
          stdout: 'Hello SkillSwap Python\n',
          stderr: '',
          exitCode: 0,
          executionTime: 80,
          status: 'success'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'python',
        code: 'print("Hello SkillSwap Python")',
        stdin: ''
      });

      assert.equal(res.status, 'success');
      assert.equal(res.exitCode, 0);
      assert.equal(res.stdout, 'Hello SkillSwap Python\n');
      assert.equal(res.stderr, '');
      assert.ok(res.executionTime >= 0);

      // Verify container options
      assert.equal(mockRunner.executedContainers.length, 1);
      assert.deepEqual(mockRunner.executedContainers[0].command, ['python', '-u', 'main.py']);

      // Verify workspace directory was cleaned up
      await assert.rejects(
        async () => await fs.access(mockRunner.lastWorkspaceDir),
        /ENOENT/
      );
    });

    it('should successfully compile and execute Java code', async () => {
      const mockRunner = new MockDockerRunner({
        mockCompileResult: {
          stdout: '',
          stderr: '',
          exitCode: 0,
          executionTime: 200,
          status: 'success'
        },
        mockExecResult: {
          stdout: 'Hello Java 21\n',
          stderr: '',
          exitCode: 0,
          executionTime: 120,
          status: 'success'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'java',
        code: 'public class Main { public static void main(String[] args) { System.out.println("Hello Java 21"); } }'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.exitCode, 0);
      assert.equal(res.stdout, 'Hello Java 21\n');

      // 2 container executions: compilation and execution
      assert.equal(mockRunner.executedContainers.length, 2);
      assert.equal(mockRunner.executedContainers[0].command[0], 'javac');
      assert.equal(mockRunner.executedContainers[1].command[0], 'java');

      // Verify workspace cleanup
      await assert.rejects(
        async () => await fs.access(mockRunner.lastWorkspaceDir),
        /ENOENT/
      );
    });

    it('should handle Java compilation errors separately from runtime errors', async () => {
      const mockRunner = new MockDockerRunner({
        mockCompileResult: {
          stdout: '',
          stderr: 'Main.java:2: error: cannot find symbol\n  fooBar();\n  ^',
          exitCode: 1,
          executionTime: 150,
          status: 'runtime_error'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'java',
        code: 'public class Main { public static void main(String[] args) { fooBar(); } }'
      });

      assert.equal(res.status, 'compilation_error');
      assert.equal(res.exitCode, 1);
      assert.ok(res.stderr.includes('cannot find symbol'));
      // Execution container should NOT have been invoked
      assert.equal(mockRunner.executedContainers.length, 1);

      // Verify workspace cleanup
      await assert.rejects(
        async () => await fs.access(mockRunner.lastWorkspaceDir),
        /ENOENT/
      );
    });

    it('should successfully compile and execute C++ code', async () => {
      const mockRunner = new MockDockerRunner({
        mockCompileResult: {
          stdout: '',
          stderr: '',
          exitCode: 0,
          executionTime: 300,
          status: 'success'
        },
        mockExecResult: {
          stdout: 'C++ Output: 42\n',
          stderr: '',
          exitCode: 0,
          executionTime: 15,
          status: 'success'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'cpp',
        code: '#include <iostream>\nint main() { std::cout << "C++ Output: 42\\n"; return 0; }'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.exitCode, 0);
      assert.equal(res.stdout, 'C++ Output: 42\n');
      assert.equal(mockRunner.executedContainers.length, 2);
      assert.equal(mockRunner.executedContainers[0].command[0], 'g++');
      assert.equal(mockRunner.executedContainers[1].command[0], './solution');
    });

    it('should handle C++ compilation errors', async () => {
      const mockRunner = new MockDockerRunner({
        mockCompileResult: {
          stdout: '',
          stderr: 'main.cpp:3:5: error: expected ";" before "return"',
          exitCode: 1,
          executionTime: 180,
          status: 'runtime_error'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'cpp',
        code: '#include <iostream>\nint main() { int x = 5 return 0; }'
      });

      assert.equal(res.status, 'compilation_error');
      assert.equal(res.exitCode, 1);
      assert.ok(res.stderr.includes('expected ";"'));
      assert.equal(mockRunner.executedContainers.length, 1);
    });

    it('should successfully execute JavaScript code', async () => {
      const mockRunner = new MockDockerRunner({
        mockExecResult: {
          stdout: 'JS Runner executed successfully\n',
          stderr: '',
          exitCode: 0,
          executionTime: 65,
          status: 'success'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'javascript',
        code: 'console.log("JS Runner executed successfully");'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.exitCode, 0);
      assert.equal(res.stdout, 'JS Runner executed successfully\n');
      assert.deepEqual(mockRunner.executedContainers[0].command, ['node', 'index.js']);
    });

    it('should handle runtime errors with non-zero exit code', async () => {
      const mockRunner = new MockDockerRunner({
        mockExecResult: {
          stdout: '',
          stderr: 'Traceback (most recent call last):\n  ZeroDivisionError: division by zero',
          exitCode: 1,
          executionTime: 50,
          status: 'runtime_error'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'python',
        code: 'print(1 / 0)'
      });

      assert.equal(res.status, 'runtime_error');
      assert.equal(res.exitCode, 1);
      assert.ok(res.stderr.includes('ZeroDivisionError'));
    });

    it('should handle execution timeouts', async () => {
      const mockRunner = new MockDockerRunner({
        mockExecResult: {
          stdout: '',
          stderr: 'Execution timed out after 5 seconds.',
          exitCode: 124,
          executionTime: 5005,
          status: 'timeout_error'
        }
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'python',
        code: 'import time\ntime.sleep(10)'
      });

      assert.equal(res.status, 'timeout_error');
      assert.equal(res.exitCode, 124);
      assert.ok(res.stderr.includes('timed out'));
    });

    it('should handle Docker daemon unavailable gracefully without crashing', async () => {
      const mockRunner = new MockDockerRunner({
        isDockerAvailable: false,
        dockerError: 'Docker daemon is not running'
      });
      const service = new ExecutionService({ dockerRunner: mockRunner, registry });

      const res = await service.execute({
        language: 'python',
        code: 'print("Hello")'
      });

      assert.equal(res.status, 'system_error');
      assert.equal(res.exitCode, -1);
      assert.ok(res.stderr.includes('Docker daemon unavailable'));
    });
  });
});
