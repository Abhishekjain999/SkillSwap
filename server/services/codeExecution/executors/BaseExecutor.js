import fs from 'fs/promises';
import path from 'path';

/**
 * Base class for all language executors.
 */
export class BaseExecutor {
  /**
   * @param {Object} options
   * @param {string} options.language - Identifier of the language (e.g. 'python')
   * @param {string} options.image - Docker image tag
   * @param {string} options.sourceFileName - Name of file in workspace (e.g. 'main.py')
   */
  constructor({ language, image, sourceFileName }) {
    if (!language || !image || !sourceFileName) {
      throw new Error('BaseExecutor requires language, image, and sourceFileName');
    }
    this.language = language;
    this.image = image;
    this.sourceFileName = sourceFileName;
  }

  getLanguage() {
    return this.language;
  }

  getImage() {
    return this.image;
  }

  getSourceFileName() {
    return this.sourceFileName;
  }

  /**
   * Writes the source code into the temporary workspace directory.
   *
   * @param {string} workspaceDir
   * @param {string} code
   */
  async prepareWorkspace(workspaceDir, code) {
    const filePath = path.join(workspaceDir, this.sourceFileName);
    await fs.writeFile(filePath, code, 'utf-8');
    return filePath;
  }

  /**
   * Optional compilation step for compiled languages (Java, C++).
   * Interpreted languages return null.
   *
   * @param {string} workspaceDir
   * @param {import('../DockerRunner.js').DockerRunner} dockerRunner
   * @returns {Promise<{ success: boolean, stdout: string, stderr: string, exitCode: number, executionTime: number } | null>}
   */
  async compile(workspaceDir, dockerRunner) {
    return null; // Interpreted by default
  }

  /**
   * Returns the command array to execute the code inside the container.
   *
   * @returns {string[]}
   */
  getExecuteCommand() {
    throw new Error('getExecuteCommand() must be implemented by subclass');
  }

  /**
   * Additional run options specific to the language.
   */
  getExecuteOptions() {
    return {};
  }
}
