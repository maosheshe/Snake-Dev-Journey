const { StatusCodes } = require('http-status-codes');

/**
 * 全局错误处理中间件
 * 统一拦截应用中抛出的所有错误，并返回格式化的 JSON 响应
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    // 开发环境下返回详细的堆栈信息
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: false,
            message: err.message,
            stack: err.stack,
            error: err
        });
    }

    // 生产环境下隐藏敏感信息
    if (err.isOperational) {
        // 可预见的业务错误
        res.status(err.statusCode).json({
            status: false,
            message: err.message
        });
    } else {
        // 未知错误（如数据库崩溃、代码逻辑漏洞等）
        console.error('ERROR 💥:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: '服务器内部发生了点意外，请稍后再试'
        });
    }
};

module.exports = errorHandler;
