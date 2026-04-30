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
        // 将 Zod 错误格式化并返回给客户端
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: '输入数据校验失败',
            errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
};

module.exports = validate;
