class ApiError extends Error {
    constructor(
        statusCode,
        message,
        // errors=[],
        // stack
    ) {
        // overriding our own error way.
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        // this.errors = errors;

        // to stack of error resulting files.
        // if (stack) {
        //     this.stack = stack;
        // } else {
        //     Error.captureStackTrace(this, this.constructor);
        // }
    }
}


export default ApiError;
