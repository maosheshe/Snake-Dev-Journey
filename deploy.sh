#!/bin/bash

# =================================================================
# 🚀 蛇蛇的开发之旅 - 生产环境一键更新脚本
# =================================================================

echo "------------------------------------------"
echo "🔍 开始检查更新..."
echo "------------------------------------------"

# 1. 拉取最新代码
echo "📥 正在从 Git 拉取最新代码..."
git pull

# 2. 更新依赖 (核心步骤！防止缺少新模块)
echo "📦 正在安装/更新依赖库..."
npm install --production

# 3. 数据库迁移 (如果更新涉及数据库表结构变动)
echo "🗄️ 正在检查数据库迁移..."
npx sequelize-cli db:migrate

# 4. 重启服务
if command -v pm2 &> /dev/null
then
    echo "♻️ 正在通过 PM2 重启服务..."
    pm2 restart ecosystem.config.js --env production
    echo "✅ 服务已通过 PM2 重启成功！"
elif [ -f "docker-compose.yml" ]; then
    echo "🐳 正在通过 Docker Compose 重启服务..."
    docker-compose up -d --build
    echo "✅ 服务已通过 Docker 重启成功！"
else
    echo "⚠️ 未检测到 PM2 或 Docker，请手动重启您的 Node.js 进程。"
fi

echo "------------------------------------------"
echo "✨ 所有更新已完成，博客已恢复在线！"
echo "------------------------------------------"
