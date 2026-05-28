class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.isOperational = true;
    }
}

const errorHandler = (err, req, res, next) => {
    console.error(err);

    const status = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Internal server error";

    res.status(status).json({
        status: "error",
        message
    });
};

const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
