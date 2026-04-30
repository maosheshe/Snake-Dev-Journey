# 蛇蛇的开发之旅 - Docker 一键部署指南 🚀

本指南旨在帮助您在任何安装了 Docker 的电脑上快速部署本博客系统。Docker 能够确保您的应用及其运行环境（Node.js, MySQL 等）被打包在一起，避免了“在我的机器上可以运行，但在别的机器上不行”的问题。

## 1. 环境准备

在开始之前，请确保目标电脑已安装以下工具：

- **Docker**: [官方下载地址](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: (现代版本的 Docker Desktop 已内置)

安装完成后，打开终端（Windows 的 PowerShell 或 Mac/Linux 的 Terminal），输入以下命令检查是否成功：
```bash
docker --version
docker-compose --version
```

## 2. 获取项目代码

将本项目的所有文件复制到目标电脑的某个文件夹中（例如 `D:\Snake-Blog`）。

## 3. 配置环境变量

Docker 会读取 `.env` 文件来配置数据库和安全密钥。

1. 在项目根目录下，找到 `env .example` 文件。
2. 复制并重命名为 `.env`。
3. 使用记事本或编辑器打开 `.env`，修改以下关键项：
   ```env
   DB_NAME=blog_db
   DB_PASSWORD=your_secure_password
   JWT_SECRET=any_random_long_string
   ```
   > **注意**：`DB_HOST` 在 Docker 环境下应保持为 `db`，因为这是我们在 `docker-compose.yml` 中定义的数据库服务名称。

## 4. 一键启动 ⚡

在项目根目录下打开终端，运行以下命令：

```bash
docker-compose up -d
```

**发生了什么？**
- `-d` 参数表示“后台运行”，这样即使你关闭终端，服务也会继续运行。
- Docker 会自动下载 MySQL 镜像。
- Docker 会根据 `Dockerfile` 构建您的 Node.js 应用镜像。
- Docker 会自动创建并连接这两个容器。

## 5. 初始化数据库（仅限首次）

由于是新电脑，数据库是空的，我们需要执行一次迁移操作来创建表结构：

```bash
docker-compose exec app npx sequelize-cli db:migrate
```

## 6. 访问您的博客

一切就绪！现在打开浏览器访问：

- **博客首页**: `http://localhost:3000`
- **API 文档**: `http://localhost:3000/api-docs`

---

## 常用管理命令 🛠️

如果您需要管理运行中的服务，可以使用以下命令：

- **查看运行状态**：
  ```bash
  docker-compose ps
  ```

- **查看运行日志**（排查错误时非常有用）：
  ```bash
  docker-compose logs -f app
  ```

- **停止并移除容器**（数据会保留在磁盘上）：
  ```bash
  docker-compose down
  ```

- **重新构建应用**（如果您修改了后端代码）：
  ```bash
  docker-compose up -d --build
  ```

## 常见问题排除

- **端口冲突**：如果提示 3000 端口已被占用，请修改 `docker-compose.yml` 中的 `ports` 部分（例如改为 `"3001:3000"`）。
- **数据库连接失败**：请确保 `.env` 中的 `DB_PASSWORD` 与 `docker-compose.yml` 中的配置一致。
