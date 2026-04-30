/**
 * 个人博客后端服务
 * 提供用户认证、文章管理等RESTful API接口
 * 实现了基本的安全防护措施
 */

// 导入所需模块
const express = require('express'); // Express Web框架
const mysql = require('mysql2'); // MySQL数据库驱动，支持Promise API
const bcrypt = require('bcrypt'); // 密码哈希加密，用于安全存储用户密码
const jwt = require('jsonwebtoken'); // JWT令牌生成与验证，用于用户会话管理
const cors = require('cors'); // 跨域资源共享中间件
const path = require('path'); // Node.js路径处理模块
const helmet = require('helmet'); // 安全HTTP头设置，增强Web安全性
const rateLimit = require('express-rate-limit'); // 请求速率限制，防止暴力攻击
const multer = require('multer'); // 处理文件上传的中间件
const http = require('http'); // HTTP 模块
const https = require('https'); // HTTPS 模块
const fs = require('fs'); // 文件系统模块
// 加载环境变量配置
require('dotenv').config();

// 创建Express应用实例
const app = express();

// 导入数据模型
const {Article} = require('./models'); // 文章数据模型
const {User} = require('./models'); // 用户数据模型
const { Op } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const sharp = require('sharp');
const { StatusCodes } = require('http-status-codes');

// 导入中间件与工具
const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');
const validate = require('./middleware/validate');
const { registerSchema, loginSchema } = require('./schemas/authSchema');
const { articleSchema } = require('./schemas/articleSchema');
    

/**
 * 配置Helmet安全中间件
 * 通过设置各种HTTP头来防止常见的Web漏洞
 * 包括XSS攻击、点击劫持、MIME类型嗅探等
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // 默认只允许同源资源
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"], // 允许加载脚本
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // 允许内联样式和 Google Fonts
            imgSrc: ["'self'", "data:", "https:"], // 允许同源图片、data URL和HTTPS图片
            connectSrc: ["'self'"], // 限制AJAX/WebSocket连接源
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // 允许加载 Google 字体文件
            objectSrc: ["'none'"], // 禁止<object>标签
            mediaSrc: ["'self'"], // 限制多媒体资源源
            frameSrc: ["'self'"] // 允许加载同源 iframe (用于 HTML 文章/游戏)
        }
    },
    crossOriginEmbedderPolicy: false // 允许跨源嵌入
}));

/**
 * 配置CORS跨域中间件
 * 根据环境配置允许的源
 * 生产环境：仅允许特定域名
 * 开发环境：允许所有域名
 */
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://badivy.cn'] // 生产环境域名白名单
        : '*', // 开发环境允许所有域名
    credentials: true // 允许跨域请求携带凭证
}));

/**
 * 配置请求速率限制中间件
 * 防止暴力攻击和DOS攻击
 * 限制每个IP在15分钟内最多发起100次请求
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 时间窗口：15分钟
    max: 1000, // 最大请求次数提高到1000
    message: '请求过于频繁，请15分钟后再试'
});

// 配置基础中间件
app.use(express.json({ limit: '50mb' })); // 解析JSON请求体，限制大小为50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // 同时增加 URL 编码限制
app.use(express.static('public')); // 提供静态文件服务
app.use(limiter); // 将速率限制应用在静态文件之后，防止加载资源时被拦截

/**
 * Swagger 配置
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "蛇蛇的开发之旅 API",
            version: "1.0.0",
            description: "个人博客系统后端接口文档",
            contact: {
                name: "Snake",
                url: "https://github.com/maosheshe/Snake-Dev-Journey"
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "开发服务器"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ["./server.js"] // 文档注释所在文件
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * 根路由处理
 * GET /
 * 直接展示首页
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * 数据库连接池配置
 * 使用连接池管理数据库连接，提高性能和可靠性
 * 所有配置参数从环境变量读取，增强安全性和灵活性
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST, // 数据库服务器地址
    user: process.env.DB_USER, // 数据库用户名
    password: process.env.DB_PASSWORD, // 数据库密码
    database: process.env.DB_NAME, // 数据库名称
    port: 3306, // MySQL默认端口
    waitForConnections: true, // 连接池满时排队等待
    connectionLimit: 10, // 最大连接数
    queueLimit: 0, // 队列长度不限制
    debug: true, // 启用调试日志
    trace: true, // 启用堆栈跟踪
    timezone: '+08:00', // 设置时区为北京时间
    dateStrings: true // 日期以字符串形式返回
});

// 创建Promise版本的连接池
const promisePool = pool.promise();

/**
 * 配置文件上传存储
 * 将上传的HTML文件存储在 public/uploads 目录中
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'game'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原始文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // 仅允许上传 .html 文件
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.html') {
            return cb(new Error('只允许上传 HTML 文件'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 限制大小为10MB
});

/**
 * 测试数据库连接
 * 在服务启动时验证数据库连接是否正常
 */
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
    connection.release();
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 用户名已存在或数据校验失败
 */
app.post('/api/register', validate(registerSchema), async (req, res, next) => {
    const { username, password } = req.body;

    try {
        console.log('开始注册流程，用户名:', username);
        
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return next(new AppError('用户名已存在', StatusCodes.BAD_REQUEST));
        }

        // 使用bcrypt加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户记录
        await User.create({
            username,
            password: hashedPassword,
            role: 'free'
        });

        res.status(StatusCodes.CREATED).json({ 
            status: true,
            message: '注册成功' 
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功，返回 JWT
 *       401:
 *         description: 用户名或密码错误
 */
app.post('/api/login', validate(loginSchema), async (req, res, next) => {
    const { username, password } = req.body;

    try {
        // 查询用户信息
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'password', 'role']
        });

        // 用户不存在
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('用户名或密码错误', StatusCodes.UNAUTHORIZED));
        }

        // 生成JWT令牌，有效期7天
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({ 
            status: true,
            token,
            role: user.role,
            username: user.username
        });
    } catch (error) {
        next(error);
    }
});

// 已移除 processCoverUrl 逻辑，由 Sharp 统一处理或直接存储 URL

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: 创建新文章
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleInput'
 *     responses:
 *       201:
 *         description: 创建成功
 */
app.post('/api/articles', validate(articleSchema), async (req, res, next) => {
    const { title, content, summary, category, tags, displayMode, coverUrl } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new AppError('未授权', StatusCodes.UNAUTHORIZED));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        const article = await Article.create({
            title,
            content,
            summary,
            category,
            tags,
            displayMode: displayMode || 'markdown',
            coverUrl,
            userId
        });

        res.status(StatusCodes.CREATED).json({
            status: true,
            message: '文章创建成功',
            articleId: article.id
        });
    } catch (error) {
        next(error);
    }
});

/**
 * 日期格式化工具函数
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(dateString) {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效时间';
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: 获取文章列表
 *     tags: [文章]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/articles', async (req, res, next) => {
    try {
        const query = req.query;
        const page = parseInt(query.page) || 1;
        const pageSize = parseInt(query.pageSize) || 12;
        const offset = (page - 1) * pageSize;
        
        const where = {};
        if (query.title || query.content) {
            where[Op.or] = [];
            if (query.title) {
                where[Op.or].push({ title: { [Op.like]: `%${query.title}%` } });
            }
            if (query.content) {
                where[Op.or].push({ content: { [Op.like]: `%${query.content}%` } });
            }
        }

        if (query.category) {
            where.category = query.category;
        }

        // 权限过滤
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                if (decoded.role !== 'admin') {
                    where.userId = decoded.userId;
                }
            } catch (err) {
                // Ignore invalid token for list view
            }
        }

        const total = await Article.count({ where });
        const articles = await Article.findAll({
            include: [{
                model: User,
                attributes: ['username'],
                as: 'user'
            }],
            order: [['createdAt', 'DESC']],
            where,
            limit: pageSize,
            offset: offset
        });
        
        res.json({
            status: true,
            message: '获取文章列表成功',
            data: {
                articles,
                pagination: {
                    total,
                    current: page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: 获取文章详情
 *     tags: [文章]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 文章不存在
 */
app.get('/api/articles/:id', async (req, res, next) => {
    const articleId = req.params.id;

    try {
        const article = await Article.findByPk(articleId, {
            include: [{
                model: User,
                attributes: ['username'],
                as: 'user'
            }]
        });

        if (!article) {
            return next(new AppError('文章不存在', StatusCodes.NOT_FOUND));
        }

        await article.increment('views');
        await article.reload();

        res.json({
            status: true,
            message: '获取文章详情成功',
            data: {
                article
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: 更新文章
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 更新成功
 */
app.put('/api/articles/:id', validate(articleSchema), async (req, res, next) => {
    const articleId = req.params.id;
    const { title, content, summary, category, tags, displayMode, coverUrl } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return next(new AppError('未授权', StatusCodes.UNAUTHORIZED));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;
    
        const article = await Article.findByPk(articleId);
    
        if (!article) {
            return next(new AppError('文章不存在', StatusCodes.NOT_FOUND));
        }
    
        if (article.userId !== userId && decoded.role !== 'admin') {
            return next(new AppError('无权修改此文章', StatusCodes.FORBIDDEN));
        }
    
        await article.update({
            title,
            content,
            summary,
            category,
            tags,
            displayMode,
            coverUrl
        });

        res.json({ 
            status: true,
            message: '文章更新成功' 
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: 删除文章
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 */
app.delete('/api/articles/:id', async (req, res, next) => {
    const articleId = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new AppError('未授权', StatusCodes.UNAUTHORIZED));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        const article = await Article.findByPk(articleId);

        if (!article) {
            return next(new AppError('文章不存在', StatusCodes.NOT_FOUND));
        }

        if (article.userId !== userId && decoded.role !== 'admin') {
            return next(new AppError('无权删除此文章', StatusCodes.FORBIDDEN));
        }

        // 删除关联的本地资源
        if (article.coverUrl && article.coverUrl.startsWith('/images/articles/')) {
            const coverPath = path.join(__dirname, 'public', article.coverUrl);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        if (article.category === '游戏' && article.content) {
            const fileName = path.basename(article.content);
            const gamePath = path.join(__dirname, 'public', 'game', fileName);
            if (fs.existsSync(gamePath)) fs.unlinkSync(gamePath);
        }

        await article.destroy();

        res.json({ 
            status: true,
            message: '文章删除成功' 
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/articles/{id}/like:
 *   post:
 *     summary: 点赞文章
 *     tags: [文章]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 点赞成功
 */
app.post('/api/articles/:id/like', async (req, res, next) => {
    const articleId = req.params.id;

    try {
        const article = await Article.findByPk(articleId);

        if (!article) {
            return next(new AppError('文章不存在', StatusCodes.NOT_FOUND));
        }

        await article.increment('likes');
        await article.reload();

        res.json({
            status: true,
            message: '点赞成功',
            data: {
                likes: article.likes
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/upload-html:
 *   post:
 *     summary: 上传 HTML 游戏文件
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 上传成功
 */
app.post('/api/upload-html', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError('未授权，请先登录', StatusCodes.UNAUTHORIZED));
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        next();
    } catch (err) {
        return next(new AppError('登录已过期', StatusCodes.UNAUTHORIZED));
    }
}, upload.single('htmlFile'), (req, res, next) => {
    if (!req.file) {
        return next(new AppError('请选择要上传的文件', StatusCodes.BAD_REQUEST));
    }
    res.json({
        status: true,
        message: '文件上传成功',
        data: {
            filename: req.file.filename
        }
    });
});

/**
 * 文章封面上传配置
 */
const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images', 'articles'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadCover = multer({
    storage: coverStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(ext)) {
            return cb(new Error('只允许上传图片文件 (jpg, png, gif, webp)'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 限制大小为10MB
});

/**
 * 文章封面上传接口
 * POST /api/upload-cover
 */
/**
 * @swagger
 * /api/upload-cover:
 *   post:
 *     summary: 上传文章封面 (自动优化)
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 上传并处理成功
 */
app.post('/api/upload-cover', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError('未授权，请先登录', StatusCodes.UNAUTHORIZED));
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        next();
    } catch (err) {
        return next(new AppError('登录已过期', StatusCodes.UNAUTHORIZED));
    }
}, uploadCover.single('coverFile'), async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('请选择要上传的文件', StatusCodes.BAD_REQUEST));
    }

    try {
        const inputPath = req.file.path;
        const outputPath = inputPath.replace(path.extname(inputPath), '.webp');
        const webpFilename = path.basename(outputPath);

        // 使用 sharp 处理图片：调整大小并转换为 WebP
        await sharp(inputPath)
            .resize(1200, 675, { // 16:9 比例
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        // 删除原始上传文件
        fs.unlinkSync(inputPath);

        res.json({
            status: true,
            message: '封面上传并优化成功',
            data: {
                url: `/images/articles/${webpFilename}`
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * 通用图片上传接口 (用于编辑器内粘贴)
 * POST /api/upload-image
 */
app.post('/api/upload-image', (req, res, next) => {
    console.log('收到内容图片上传请求');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: false, message: '未授权，请先登录' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        next();
    } catch (err) {
        return res.status(401).json({ status: false, message: '登录已过期' });
    }
}, (req, res, next) => {
    uploadCover.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer 内容图片上传错误:', err);
            return next(err);
        }
        next();
    });
}, (req, res) => {
    console.log('内容图片上传成功:', req.file?.filename);
    if (!req.file) {
        return res.status(400).json({ status: false, message: '请选择要上传的文件' });
    }
    res.json({
        status: true,
        message: '图片上传成功',
        data: {
            url: `/images/articles/${req.file.filename}`
        }
    });
});

// 使用全局错误处理中间件
app.use(errorHandler);

// 启动服务器
const { sequelize } = require('./models');

const startServer = async (port) => {
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        app.listen(port, () => {
            console.log(`🚀 服务器已成功启动！端口: ${port}`);
        }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ 错误: 端口 ${port} 已被占用。`);
        } else {
            console.error('❌ 服务器启动发生异常:', err);
        }
            console.error('❌ 服务器运行错误:', err.message);
        });
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
    }
};

const PORT = process.env.PORT || 3001;
startServer(PORT);