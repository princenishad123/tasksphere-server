/**
 * Custom API Error class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param {number} statusCode - HTTP status code
     * @param {string} [message="Something went wrong"] - Error message
     * @param {Array} [errors=[]] - Additional error details
     * @param {string} [stack=""] - Stack trace
     * @param {boolean} success - Stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
        success = false
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.data = null;
        this.success = success

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default  ApiError ;