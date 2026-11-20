import { BaseExecutor } from './BaseExecutor.js';
import { config } from '../config.js';

/**
 * JavaScript (Node.js LTS) Language Executor
 */
export class JavaScriptExecutor extends BaseExecutor {
  constructor() {
    super({
      language: 'javascript',
      image: config.images.javascript,
      sourceFileName: 'index.js',
    });
  }

  getExecuteCommand() {
    return ['node', 'index.js'];
  }
}
