import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  // Send a generic error response
  res.status(500).json({ message: 'Something went wrong' });
};