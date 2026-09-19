import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Clean request body for logging (redact sensitive fields like passwords)
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = '[REDACTED]';

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl || req.url}`, err, {
    statusCode,
    body: safeBody,
    query: req.query,
    params: req.params,
    ip: req.ip || req.socket.remoteAddress
  });

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    errorCode: err.code || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;
