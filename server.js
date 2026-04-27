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
const {Op} = require('sequelize');
    

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
        cb(null, path.join(__dirname, 'public', 'uploads'));
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
 * 用户注册接口
 * POST /api/register
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {object} message - 注册结果消息
 */
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('开始注册流程，用户名:', username);
        
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            console.log('用户名已存在:', username);
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 使用bcrypt加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('密码加密完成');

        // 创建新用户记录
        await User.create({
            username,
            password: hashedPassword,
            role: 'free'
        });
        console.log('用户数据插入成功');

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误详情:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '服务器错误' });
    }
});

/**
 * 用户登录接口
 * POST /api/login
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {object} token - JWT访问令牌
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
console.log('开始登录流程，用户名:', username,password);
    try {
        // 查询用户信息
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'password', 'role', 'createdAt', 'updatedAt']
        });

        // 用户不存在
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成JWT令牌，有效期7天
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({ 
            token,
            role: user.role,
            username: user.username
        });
    } catch (error) {
        console.error('详细错误:', error.stack); // 输出堆栈信息
        res.status(500).json({ status: false, message: error.message }); // 返回具体错误
    }
});

/**
 * 处理封面 URL
 * 如果是外部链接，则下载到本地
 * @param {string} coverUrl - 封面 URL
 * @returns {Promise<object>} - { success: boolean, url: string }
 */
async function processCoverUrl(coverUrl) {
    if (!coverUrl || typeof coverUrl !== 'string' || !coverUrl.startsWith('http')) {
        return { success: true, url: coverUrl };
    }

    if (coverUrl.startsWith('/images/articles/')) {
        return { success: true, url: coverUrl };
    }

    try {
        const urlObj = new URL(coverUrl);
        const extension = path.extname(urlObj.pathname) || '.jpg';
        const filename = `downloaded-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
        const targetPath = path.join(__dirname, 'public', 'images', 'articles', filename);
        
        return new Promise((resolve) => {
            const client = coverUrl.startsWith('https') ? https : http;
            
            const request = client.get(coverUrl, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const nextUrl = res.headers.location.startsWith('http') 
                        ? res.headers.location 
                        : new URL(res.headers.location, coverUrl).href;
                    request.destroy();
                    return resolve(processCoverUrl(nextUrl));
                }

                if (res.statusCode !== 200) {
                    return resolve({ success: false, url: coverUrl });
                }

                const fileStream = fs.createWriteStream(targetPath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve({ success: true, url: `/images/articles/${filename}` });
                });
                fileStream.on('error', () => {
                    fs.unlink(targetPath, () => {});
                    resolve({ success: false, url: coverUrl });
                });
            });

            request.on('error', () => resolve({ success: false, url: coverUrl }));
            request.setTimeout(10000, () => {
                request.destroy();
                resolve({ success: false, url: coverUrl });
            });
        });
    } catch (e) {
        return { success: false, url: coverUrl };
    }
}

/**
 * 创建文章接口
 * POST /api/articles
 * 需要JWT令牌验证
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @returns {object} 包含状态、消息和文章ID
 */
app.post('/api/articles', async (req, res) => {
        const { title, content, category, tags, displayMode, coverUrl, forceSave } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
    console.log('token:',token);
        if (!token) {
            return res.status(401).json({
                 status: false,
                 message: '未授权' });
        }
    
        try {
            // 验证JWT令牌
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
    
            // 处理封面 URL
            console.log('正在处理封面 URL...');
            const result = await processCoverUrl(coverUrl);
            
            if (!result.success && !forceSave) {
                return res.status(400).json({
                    status: false,
                    errorCode: 'DOWNLOAD_FAILED',
                    message: '无法下载外部图片，请确认链接是否有效'
                });
            }
            
            const localCoverUrl = result.url;
            console.log('封面 URL 处理完成:', localCoverUrl);

        // 创建新文章
        const article = await Article.create({
            title,
            content,
            category,
            tags,
            displayMode: displayMode || 'markdown',
            coverUrl: localCoverUrl,
            userId
        });

        res.status(201).json({
            status: true,
            message: '文章创建成功',
            articleId: article.id
        });
    } catch (error) {
        console.error('创建文章错误详情:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误: ' + error.message });
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
 * 获取文章列表接口
 * GET /api/articles
 * @returns {object} 包含状态、消息和文章列表数据
 */
app.get('/api/articles', async (req, res) => {
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

        // 权限过滤：如果是后台管理请求（携带有效 token）
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                // 如果不是管理员，只能看自己的文章
                if (decoded.role !== 'admin') {
                    where.userId = decoded.userId;
                    console.log(`用户 ${decoded.username} 正在查看自己的文章列表`);
                } else {
                    console.log(`管理员 ${decoded.username} 正在查看所有文章列表`);
                }
            } catch (err) {
                // Token 无效或过期，不执行额外过滤（作为公开请求处理）
            }
        }

        // 查询文章总数
        const total = await Article.count({ where });
        
        // 查询分页后的文章及其作者信息
        const articles = await Article.findAll({
            include: [{
                model: User,
                attributes: ['username'],
                as: 'user'
            }],
            order: [['createdAt', 'DESC']], // 按创建时间降序排序
            where,
            limit: pageSize,
            offset: offset
        });
        
        res.json({
            status: true,
            message: '获取文章列表成功',
            data: {
                articles: articles.map(article => ({
                    ...article.get({ plain: true }),
                    user: article.user ? article.user.get({ plain: true }) : null
                })),
                pagination: {
                    total,
                    current: page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize)
                }
            }
        });
    } catch (error) {
        console.error('获取文章列表错误:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误' 
        });
    }
});

/**
 * 获取文章详情接口
 * GET /api/articles/:id
 * @param {string} id - 文章ID
 * @returns {object} 包含状态、消息和文章详细信息
 */
app.get('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;

    try {
        // 查询文章及其作者信息
        const article = await Article.findByPk(articleId, {
            include: [{
                model: User,
                attributes: ['username'],
                as: 'user'
            }]
        });

        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 增加阅读量
        await article.increment('views');
        // 刷新模型以获取更新后的阅读量
        await article.reload();

        res.json({
            status: true,
            message: '获取文章详情成功',
            data: {
                article: {
                    ...article.get({ plain: true }),
                    user: article.user ? article.user.get({ plain: true }) : null
                }
            }
        });
    } catch (error) {
        console.error('获取文章详情错误:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误' 
        });
    }
});

/**
 * 更新文章接口
 * PUT /api/articles/:id
 * 需要JWT令牌验证
 * @param {string} id - 文章ID
 * @param {string} title - 新的文章标题
 * @param {string} content - 新的文章内容
 * @returns {object} 包含状态和消息
 */
app.put('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
        const { title, content, category, tags, displayMode, coverUrl, forceSave } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
    
        if (!token) {
            return res.status(401).json({
                 status: false,
                 message: '未授权' });
        }
    
        try {
            // 验证JWT令牌
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
    
            // 检查文章是否存在
            const article = await Article.findByPk(articleId);
    
            if (!article) {
                return res.status(404).json({ 
                    status: false,
                    message: '文章不存在' });
            }
    
            // 只有作者本人或管理员可以修改
            if (article.userId !== userId && decoded.role !== 'admin') {
                return res.status(403).json({ 
                    status: false,
                    message: '无权修改此文章' });
            }
    
            // 处理封面 URL
            const result = await processCoverUrl(coverUrl);

            if (!result.success && !forceSave) {
                return res.status(400).json({
                    status: false,
                    errorCode: 'DOWNLOAD_FAILED',
                    message: '无法下载外部图片，请确认链接是否有效'
                });
            }

            const localCoverUrl = result.url;

        // 更新文章内容
        await article.update({
            title: title,
            content: content,
            category: category,
            tags: tags,
            displayMode: displayMode,
            coverUrl: localCoverUrl
        });

        res.json({ 
            status: true,
            message: '文章更新成功' 
        });
    } catch (error) {
        console.error('更新文章错误详情:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误: ' + error.message });
    }
});

/**
 * 删除文章接口
 * DELETE /api/articles/:id
 * 需要JWT令牌验证
 * @param {string} id - 文章ID
 * @returns {object} 包含状态和消息
 */
app.delete('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            status: false,
            message: '未授权' });
    }

    try {
        // 验证JWT令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 检查文章是否存在
        const article = await Article.findByPk(articleId);

        if (!article) {
            return res.status(404).json({ 
                status: false,
                message: '文章不存在' });
        }

        // 只有作者本人或管理员可以删除
        if (article.userId !== userId && decoded.role !== 'admin') {
            return res.status(403).json({ 
                status: false,
                message: '无权删除此文章' });
        }

        // 删除关联的本地封面图
        if (article.coverUrl && article.coverUrl.startsWith('/images/articles/')) {
            const coverPath = path.join(__dirname, 'public', article.coverUrl);
            if (fs.existsSync(coverPath)) {
                try {
                    fs.unlinkSync(coverPath);
                    console.log(`删除了关联的封面图: ${coverPath}`);
                } catch (err) {
                    console.error('删除封面图失败:', err);
                }
            }
        }

        // 删除关联的 HTML 文件 (如果是 inject 或 iframe 模式)
        if (article.displayMode && article.displayMode !== 'markdown' && article.content) {
            const fileName = path.basename(article.content);
            const htmlPath = path.join(__dirname, 'public', 'uploads', fileName);
            if (fs.existsSync(htmlPath)) {
                try {
                    fs.unlinkSync(htmlPath);
                    console.log(`删除了关联的HTML文件: ${htmlPath}`);
                } catch (err) {
                    console.error('删除HTML文件失败:', err);
                }
            }
        }

        // 删除文章
        await article.destroy();

        res.json({ 
            status: true,
            message: '文章删除成功' });
    } catch (error) {
        console.error('删除文章错误:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误' });
    }
});

/**
 * 文章点赞接口
 * POST /api/articles/:id/like
 * @param {string} id - 文章ID
 * @returns {object} 包含状态、消息和更新后的点赞数
 */
app.post('/api/articles/:id/like', async (req, res) => {
    const articleId = req.params.id;

    try {
        const article = await Article.findByPk(articleId);

        if (!article) {
            return res.status(404).json({ 
                status: false, 
                message: '文章不存在' 
            });
        }

        // 增加点赞数
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
        console.error('点赞文章错误:', error);
        res.status(500).json({ 
            status: false,
            message: '服务器错误' 
        });
    }
});

/**
 * HTML 文件上传接口
 * POST /api/upload-html
 * 仅限已登录用户上传
 */
app.post('/api/upload-html', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: false, message: '未授权，请先登录' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ status: false, message: '登录已过期' });
    }
}, upload.single('htmlFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: false, message: '请选择要上传的文件' });
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
app.post('/api/upload-cover', (req, res, next) => {
    console.log('收到封面上传请求');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('封面上传失败: 未提供 token');
        return res.status(401).json({ status: false, message: '未授权，请先登录' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        next();
    } catch (err) {
        console.log('封面上传失败: token 验证失败', err.message);
        return res.status(401).json({ status: false, message: '登录已过期' });
    }
}, (req, res, next) => {
    // 增加一个额外的错误处理中间件来捕获 multer 错误
    uploadCover.single('coverFile')(req, res, (err) => {
        if (err) {
            console.error('Multer 封面上传错误:', err);
            return next(err);
        }
        next();
    });
}, (req, res) => {
    console.log('封面上传成功:', req.file?.filename);
    if (!req.file) {
        return res.status(400).json({ status: false, message: '请选择要上传的文件' });
    }
    res.json({
        status: true,
        message: '封面上传成功',
        data: {
            url: `/images/articles/${req.file.filename}`
        }
    });
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

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回 JSON 响应
 */
app.use((err, req, res, next) => {
    console.error('全局错误拦截:', err);
    
    // 处理 Payload Too Large 错误 (来自 express.json)
    if (err.type === 'entity.too.large' || err.status === 413) {
        return res.status(413).json({ 
            status: false, 
            message: '提交内容过大，请减小图片体积或分次提交' 
        });
    }

    // 处理 Multer 错误
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ status: false, message: '文件大小不能超过限制' });
        }
        return res.status(400).json({ status: false, message: '文件上传错误: ' + err.message });
    }
    
    res.status(err.status || 500).json({
        status: false,
        message: err.message || '服务器内部错误'
    });
});

// 启动服务器
const startServer = (port) => {
    app.listen(port, () => {
        console.log(`🚀 服务器已成功启动！`);
        console.log(`🔗 内部访问: http://localhost:${port}`);
        console.log(`📡 Nginx 转发目标应指向此端口: 3001`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ 错误: 端口 ${port} 已被占用。`);
        } else {
            console.error('❌ 服务器启动发生异常:', err);
        }
        process.exit(1);
    });
};

const PORT = process.env.PORT || 3001;
startServer(PORT);