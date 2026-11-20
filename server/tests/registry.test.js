import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ExecutorRegistry } from '../services/codeExecution/executors/ExecutorRegistry.js';
import { PythonExecutor } from '../services/codeExecution/executors/PythonExecutor.js';
import { JavaExecutor } from '../services/codeExecution/executors/JavaExecutor.js';
import { CppExecutor } from '../services/codeExecution/executors/CppExecutor.js';
import { JavaScriptExecutor } from '../services/codeExecution/executors/JavaScriptExecutor.js';

describe('ExecutorRegistry', () => {
  const registry = new ExecutorRegistry();

  it('should support default languages: python, java, cpp, javascript', () => {
    assert.equal(registry.isSupported('python'), true);
    assert.equal(registry.isSupported('java'), true);
    assert.equal(registry.isSupported('cpp'), true);
    assert.equal(registry.isSupported('javascript'), true);
  });

  it('should resolve language aliases correctly', () => {
    assert.equal(registry.resolveKey('py'), 'python');
    assert.equal(registry.resolveKey('python3'), 'python');
    assert.equal(registry.resolveKey('c++'), 'cpp');
    assert.equal(registry.resolveKey('g++'), 'cpp');
    assert.equal(registry.resolveKey('js'), 'javascript');
    assert.equal(registry.resolveKey('node'), 'javascript');
    assert.equal(registry.resolveKey('nodejs'), 'javascript');
  });

  it('should reject unsupported languages', () => {
    assert.equal(registry.isSupported('ruby'), false);
    assert.equal(registry.isSupported('rust'), false);
    assert.equal(registry.isSupported(''), false);
    assert.equal(registry.isSupported(null), false);
    assert.throws(() => registry.getExecutor('unsupported_lang'), /Unsupported programming language/);
  });

  it('should return appropriate executor instance for each language', () => {
    assert.ok(registry.getExecutor('python') instanceof PythonExecutor);
    assert.ok(registry.getExecutor('java') instanceof JavaExecutor);
    assert.ok(registry.getExecutor('cpp') instanceof CppExecutor);
    assert.ok(registry.getExecutor('javascript') instanceof JavaScriptExecutor);
  });

  it('should provide metadata and starter templates for all supported languages', () => {
    const list = registry.getSupportedLanguages();
    assert.ok(Array.isArray(list));
    assert.equal(list.length >= 4, true);

    const pythonInfo = list.find(l => l.id === 'python');
    assert.ok(pythonInfo);
    assert.equal(pythonInfo.name, 'Python');
    assert.ok(pythonInfo.template.includes('SkillSwap'));
  });
});
