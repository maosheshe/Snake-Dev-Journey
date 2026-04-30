const { z } = require('zod');

const articleSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "标题是必填项"
        }).min(2, "标题至少需要2个字符").max(100, "标题不能超过100个字符"),
        
        content: z.string({
            required_error: "内容是必填项"
        }).min(10, "内容至少需要10个字符"),
        
        summary: z.string().optional(),
        
        category: z.string().optional().default('未分类'),
        
        tags: z.string().optional().default(''),
        
        displayMode: z.enum(['markdown', 'inject', 'iframe', 'direct']).optional().default('markdown'),
        
        coverUrl: z.string().url("封面链接格式不正确").or(z.string().regex(/^\/images\//)).optional(),
        
        forceSave: z.boolean().optional()
    })
});

module.exports = {
    articleSchema
};
