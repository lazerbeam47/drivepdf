export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, "Route not found."));
}

export function errorHandler(err, _req, res, _next) {
  void _next;
  const status = err.status || 500;
  const payload = {
    error: {
      message: status >= 500 ? "Unexpected server error." : err.message,
    },
  };

  if (err.details) payload.error.details = err.details;
  if (process.env.NODE_ENV !== "production" && status >= 500) {
    payload.error.debug = err.message;
  }

  res.status(status).json(payload);
}
