const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        username: z.string({
            required_error: "用户名是必填项"
        }).min(3, "用户名至少需要3个字符").max(20, "用户名不能超过20个字符"),
        
        password: z.string({
            required_error: "密码是必填项"
        }).min(6, "密码至少需要6个字符")
    })
});

const loginSchema = z.object({
    body: z.object({
        username: z.string({
            required_error: "用户名是必填项"
        }),
        password: z.string({
            required_error: "密码是必填项"
        })
    })
});

module.exports = {
    registerSchema,
    loginSchema
};
