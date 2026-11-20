import os from 'os';
import path from 'path';

/**
 * Docker Code Execution Engine Configuration
 * All limits and parameters are configurable via environment variables.
 */
export const config = {
  // Execution time limit in milliseconds
  timeoutMs: parseInt(process.env.CODE_EXEC_TIMEOUT_MS, 10) || 5000,

  // Resource limits
  memoryLimit: process.env.CODE_EXEC_MEMORY_LIMIT || '256m',
  cpuLimit: process.env.CODE_EXEC_CPU_LIMIT || '1.0',
  pidsLimit: parseInt(process.env.CODE_EXEC_PIDS_LIMIT, 10) || 64,

  // Payload limits
  maxOutputBytes: parseInt(process.env.CODE_EXEC_MAX_OUTPUT_BYTES, 10) || 1024 * 1024, // 1 MB
  maxCodeSize: parseInt(process.env.CODE_EXEC_MAX_CODE_SIZE, 10) || 100 * 1024, // 100 KB
  maxStdinSize: parseInt(process.env.CODE_EXEC_MAX_STDIN_SIZE, 10) || 100 * 1024, // 100 KB

  // Concurrency & rate limits
  maxConcurrentExecutions: parseInt(process.env.CODE_EXEC_MAX_CONCURRENT, 10) || 5,

  // Docker CLI binary
  dockerCmd: process.env.DOCKER_CMD || 'docker',

  // Security restrictions
  network: process.env.DOCKER_NETWORK || 'none',
  readOnlyRootFs: process.env.DOCKER_READONLY_FS !== 'false',
  user: process.env.DOCKER_USER || '1000:1000',

  // Temp workspace directory
  tempDir: process.env.CODE_EXEC_TEMP_DIR || path.join(os.tmpdir(), 'skillswap-code-exec'),

  // Trusted Docker Images per Language
  images: {
    python: process.env.DOCKER_IMAGE_PYTHON || 'python:3.12-slim',
    java: process.env.DOCKER_IMAGE_JAVA || 'openjdk:21-slim',
    cpp: process.env.DOCKER_IMAGE_CPP || 'gcc:13-bookworm',
    javascript: process.env.DOCKER_IMAGE_NODE || 'node:20-slim',
  },

  // Starter Code Templates
  templates: {
    python: `# Python 3.12 in isolated Docker container
import sys

def main():
    print("Hello from SkillSwap Python Runner!")

if __name__ == "__main__":
    main()
`,
    java: `// Java 21 in isolated Docker container
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SkillSwap Java Runner!");
    }
}
`,
    cpp: `// C++17 in isolated Docker container
#include <iostream>
#include <string>

int main() {
    std::cout << "Hello from SkillSwap C++ Runner!" << std::endl;
    return 0;
}
`,
    javascript: `// Node.js LTS in isolated Docker container
function main() {
    console.log("Hello from SkillSwap JavaScript Runner!");
}

main();
`
  }
};
