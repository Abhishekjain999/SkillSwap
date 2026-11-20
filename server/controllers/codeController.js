import { defaultExecutionService } from '../services/codeExecution/ExecutionService.js';
import { config } from '../services/codeExecution/config.js';

/**
 * Controller for handling code execution requests.
 */
export const executeCode = async (req, res, next) => {
  try {
    const { language, code, stdin } = req.body;
    const userId = req.user?._id?.toString() || 'anonymous';

    const result = await defaultExecutionService.execute({
      language,
      code,
      stdin,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
      // For convenience and backwards compatibility:
      ...result,
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

/**
 * Controller for listing supported execution languages and system limits.
 */
export const getSupportedLanguages = (req, res) => {
  const languages = defaultExecutionService.getSupportedLanguages();
  return res.status(200).json({
    success: true,
    languages,
    limits: {
      timeoutMs: config.timeoutMs,
      memoryLimit: config.memoryLimit,
      cpuLimit: config.cpuLimit,
      pidsLimit: config.pidsLimit,
      maxOutputBytes: config.maxOutputBytes,
      maxCodeSizeBytes: config.maxCodeSize,
      maxStdinSizeBytes: config.maxStdinSize,
    },
  });
};
