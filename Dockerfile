FROM node:18-alpine

# 安装构建依赖 (对于 bcrypt 等原生模块)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
