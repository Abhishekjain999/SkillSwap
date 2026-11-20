import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PythonExecutor } from '../services/codeExecution/executors/PythonExecutor.js';
import { JavaExecutor } from '../services/codeExecution/executors/JavaExecutor.js';
import { CppExecutor } from '../services/codeExecution/executors/CppExecutor.js';
import { JavaScriptExecutor } from '../services/codeExecution/executors/JavaScriptExecutor.js';

describe('Language Executors', () => {
  let testDir;

  before(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skillswap-executor-test-'));
  });

  after(async () => {
    if (testDir) {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  describe('PythonExecutor', () => {
    it('should configure python 3.12 runner and command', async () => {
      const executor = new PythonExecutor();
      assert.equal(executor.getLanguage(), 'python');
      assert.equal(executor.getSourceFileName(), 'main.py');
      assert.deepEqual(executor.getExecuteCommand(), ['python', '-u', 'main.py']);

      const code = 'print("test")';
      const filePath = await executor.prepareWorkspace(testDir, code);
      const content = await fs.readFile(filePath, 'utf-8');
      assert.equal(content, code);
    });
  });

  describe('JavaExecutor', () => {
    it('should detect public class name and set appropriate filename', async () => {
      const executor = new JavaExecutor();
      assert.equal(executor.getLanguage(), 'java');

      const customClassCode = 'public class CustomSolver { public static void main(String[] args) {} }';
      const filePath = await executor.prepareWorkspace(testDir, customClassCode);
      assert.equal(path.basename(filePath), 'CustomSolver.java');
      assert.deepEqual(executor.getExecuteCommand(), ['java', '-Xmx128m', '-Xss512k', 'CustomSolver']);

      const defaultCode = 'class Helper { public static void main(String[] args) {} }';
      const defaultPath = await executor.prepareWorkspace(testDir, defaultCode);
      assert.equal(path.basename(defaultPath), 'Main.java');
      assert.deepEqual(executor.getExecuteCommand(), ['java', '-Xmx128m', '-Xss512k', 'Main']);
    });
  });

  describe('CppExecutor', () => {
    it('should configure C++17 compilation and binary execution', async () => {
      const executor = new CppExecutor();
      assert.equal(executor.getLanguage(), 'cpp');
      assert.equal(executor.getSourceFileName(), 'main.cpp');
      assert.deepEqual(executor.getExecuteCommand(), ['./solution']);

      const code = '#include <iostream>\nint main() { return 0; }';
      const filePath = await executor.prepareWorkspace(testDir, code);
      const content = await fs.readFile(filePath, 'utf-8');
      assert.equal(content, code);
    });
  });

  describe('JavaScriptExecutor', () => {
    it('should configure Node.js execution', async () => {
      const executor = new JavaScriptExecutor();
      assert.equal(executor.getLanguage(), 'javascript');
      assert.equal(executor.getSourceFileName(), 'index.js');
      assert.deepEqual(executor.getExecuteCommand(), ['node', 'index.js']);

      const code = 'console.log("hello");';
      const filePath = await executor.prepareWorkspace(testDir, code);
      const content = await fs.readFile(filePath, 'utf-8');
      assert.equal(content, code);
    });
  });
});
