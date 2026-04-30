/**
 * 自定义应用错误类
 * 扩展原生 Error 类，支持 HTTP 状态码和业务标志
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // 标记是否为可预见的业务错误

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
