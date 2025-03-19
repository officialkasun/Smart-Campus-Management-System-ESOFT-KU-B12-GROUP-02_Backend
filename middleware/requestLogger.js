import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  // Log the request method, URL, and timestamp
  logger.info(`${req.method} ${req.url}`);

  // Log the request body (if present)
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }

  // Log the request query parameters (if present)
  if (req.query && Object.keys(req.query).length > 0) {
    logger.info(`Query Parameters: ${JSON.stringify(req.query)}`);
  }

  next(); // Pass control to the next middleware
};