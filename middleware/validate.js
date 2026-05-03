const { StatusCodes } = require('http-status-codes');

/**
 * Zod 请求校验中间件
 * @param {Object} schema - Zod 校验架构
 * 支持校验 body, query 和 params
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        // 记录详细错误以供调试
        console.error('Validation Error:', error);

        // Zod 错误通常包含 issues 或 errors 属性
        const errorList = error.errors || error.issues || [];
        
        // 优化错误消息：如果是校验失败，取第一个错误的提示作为主消息
        let mainMessage = '输入数据校验失败';
        if (errorList.length > 0) {
            mainMessage = errorList[0].message;
        } else if (error.message && !error.message.includes('[{')) {
            // 如果 error.message 不是 JSON 字符串，则使用它
            mainMessage = error.message;
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: mainMessage,
            errors: errorList.length > 0 ? errorList.map(err => ({
                path: err.path ? err.path.join('.') : 'unknown',
                message: err.message
            })) : undefined
        });
    }
};

module.exports = validate;
