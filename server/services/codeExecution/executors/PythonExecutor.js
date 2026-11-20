import { BaseExecutor } from './BaseExecutor.js';
import { config } from '../config.js';

/**
 * Python Language Executor (Python 3.12)
 */
export class PythonExecutor extends BaseExecutor {
  constructor() {
    super({
      language: 'python',
      image: config.images.python,
      sourceFileName: 'main.py',
    });
  }

  getExecuteCommand() {
    // -u ensures unbuffered binary stdout and stderr
    return ['python', '-u', 'main.py'];
  }
}
