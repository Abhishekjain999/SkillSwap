import { PythonExecutor } from './PythonExecutor.js';
import { JavaExecutor } from './JavaExecutor.js';
import { CppExecutor } from './CppExecutor.js';
import { JavaScriptExecutor } from './JavaScriptExecutor.js';
import { config } from '../config.js';

/**
 * Registry and factory for language executors.
 * Easily extensible to add new programming languages.
 */
export class ExecutorRegistry {
  constructor() {
    this.executors = new Map();
    this.aliases = new Map();
    this.metadata = new Map();

    this.registerDefaults();
  }

  registerDefaults() {
    // 1. Python
    this.register('python', PythonExecutor, {
      name: 'Python',
      version: '3.12',
      monacoId: 'python',
      template: config.templates.python,
      image: config.images.python,
    }, ['py', 'python3']);

    // 2. Java
    this.register('java', JavaExecutor, {
      name: 'Java',
      version: 'OpenJDK 21',
      monacoId: 'java',
      template: config.templates.java,
      image: config.images.java,
    }, ['jdk', 'java21']);

    // 3. C++
    this.register('cpp', CppExecutor, {
      name: 'C++',
      version: 'GCC 13 (C++17)',
      monacoId: 'cpp',
      template: config.templates.cpp,
      image: config.images.cpp,
    }, ['c++', 'cplusplus', 'g++']);

    // 4. JavaScript
    this.register('javascript', JavaScriptExecutor, {
      name: 'JavaScript',
      version: 'Node.js LTS',
      monacoId: 'javascript',
      template: config.templates.javascript,
      image: config.images.javascript,
    }, ['js', 'node', 'nodejs']);
  }

  /**
   * Register a language executor class.
   *
   * @param {string} language - Canonical language key
   * @param {typeof import('./BaseExecutor.js').BaseExecutor} ExecutorClass - Executor class constructor
   * @param {Object} meta - Display metadata
   * @param {string[]} [aliases=[]] - Optional alternative identifiers
   */
  register(language, ExecutorClass, meta = {}, aliases = []) {
    const key = language.toLowerCase();
    this.executors.set(key, ExecutorClass);
    this.metadata.set(key, { id: key, ...meta });

    for (const alias of aliases) {
      this.aliases.set(alias.toLowerCase(), key);
    }
  }

  /**
   * Resolve an input language string to its canonical key.
   *
   * @param {string} lang
   * @returns {string|null}
   */
  resolveKey(lang) {
    if (!lang || typeof lang !== 'string') return null;
    const clean = lang.trim().toLowerCase();
    if (this.executors.has(clean)) return clean;
    if (this.aliases.has(clean)) return this.aliases.get(clean);
    return null;
  }

  /**
   * Check if a language is supported.
   *
   * @param {string} lang
   * @returns {boolean}
   */
  isSupported(lang) {
    return this.resolveKey(lang) !== null;
  }

  /**
   * Get an instantiated executor for the requested language.
   *
   * @param {string} lang
   * @returns {import('./BaseExecutor.js').BaseExecutor}
   */
  getExecutor(lang) {
    const key = this.resolveKey(lang);
    if (!key) {
      const supported = Array.from(this.executors.keys()).join(', ');
      throw new Error(`Unsupported programming language: "${lang}". Supported languages: ${supported}`);
    }

    const ExecutorClass = this.executors.get(key);
    return new ExecutorClass();
  }

  /**
   * List all registered languages with their metadata.
   */
  getSupportedLanguages() {
    return Array.from(this.executors.keys()).map((key) => {
      const meta = this.metadata.get(key) || {};
      return {
        id: key,
        name: meta.name || key,
        version: meta.version || 'latest',
        monacoId: meta.monacoId || key,
        template: meta.template || '',
        image: meta.image || '',
      };
    });
  }
}

export const defaultExecutorRegistry = new ExecutorRegistry();
