# 中国展示版部署指南

这份文档用于把“恒河沙智能体交易网”部署到中国香港服务器，做一个中国大陆用户更容易访问的展示版。

这套方案适合：

- 先给客户、朋友、合作方展示网站
- 先用单台服务器快速上线
- 先跑通完整站点，再决定是否做大陆正式合规版

这套方案不等于中国大陆正式商用部署。
如果后面要长期在中国大陆正式运营，仍建议走大陆服务器、备案、国内模型和对象存储。

## 当前方案特点

- 前后端同域部署，不再依赖 Vercel + Render 的跨域链路
- React 前端先构建，再由 Express 统一对外提供
- `/api/*` 继续走后端接口
- `/uploads/*` 继续提供上传文件
- 演示数据和上传目录持久化到宿主机
- 支持直接用 Docker 一键拉起

## 推荐服务器

- 腾讯云轻量应用服务器，中国香港
- 阿里云 ECS，中国香港

建议最低配置：

- 2 核 CPU
- 2GB 内存
- 40GB 磁盘
- 放通 80 端口

如果后面要上 HTTPS，再额外放通：

- 443

## 仓库内相关文件

- [Dockerfile.china-hk](C:/Users/william/Documents/New%20project/Dockerfile.china-hk)
- [docker-compose.china-hk.yml](C:/Users/william/Documents/New%20project/docker-compose.china-hk.yml)
- [scripts/deploy-china-hk.sh](C:/Users/william/Documents/New%20project/scripts/deploy-china-hk.sh)

## 最快部署方式

### 方式一：登录服务器后执行脚本

```bash
git clone https://github.com/weiliangal/henghesha-agent-marketplace.git
cd henghesha-agent-marketplace
bash scripts/deploy-china-hk.sh
```

脚本会自动完成：

- 检查 `git`、`docker`、`docker compose`
- 拉取或更新代码
- 创建持久化目录
- 生成运行时环境变量文件
- 构建并启动容器

默认运行时配置文件会生成在：

```text
/opt/henghesha-agent-marketplace/deploy/china-hk/runtime.env
```

### 方式二：手动部署

#### 1. 安装基础依赖

```bash
apt update
apt install -y git docker.io docker-compose-v2
systemctl enable docker
systemctl start docker
```

#### 2. 拉取代码

```bash
git clone https://github.com/weiliangal/henghesha-agent-marketplace.git
cd henghesha-agent-marketplace
```

#### 3. 准备运行时环境变量

创建文件：

```bash
mkdir -p deploy/china-hk
cat > deploy/china-hk/runtime.env <<'EOF'
PUBLIC_PORT=80
CLIENT_ORIGIN=
JWT_SECRET=请换成你自己的随机长字符串
DATABASE_PATH=./data/marketplace.sqlite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
EOF
```

说明：

- `OPENAI_API_KEY` 暂时可以留空，系统会返回本地 mock 结果用于展示
- `CLIENT_ORIGIN` 留空也没问题，因为当前中国展示版走同域部署

#### 4. 启动服务

```bash
docker compose -f docker-compose.china-hk.yml --env-file deploy/china-hk/runtime.env up -d --build
```

#### 5. 查看运行状态

```bash
docker compose -f docker-compose.china-hk.yml --env-file deploy/china-hk/runtime.env ps
docker compose -f docker-compose.china-hk.yml --env-file deploy/china-hk/runtime.env logs -f
```

## 腾讯云轻量服务器建议操作

如果你不想手动 SSH，也可以直接用腾讯云控制台里的“执行命令”。

建议顺序：

1. 在“防火墙”里放通 `80`
2. 在“执行命令”里执行部署命令
3. 打开下面两个地址检查结果

网站首页：

```text
http://你的服务器IP
```

健康检查：

```text
http://你的服务器IP/api/health
```

## 数据持久化

宿主机上会保留：

- 数据库目录：`./deploy/china-hk/data`
- 上传目录：`./deploy/china-hk/uploads`

即使容器重建，这两部分数据也不会丢。

## 更新部署

如果后面你改了代码，重新登录服务器后执行：

```bash
cd /opt/henghesha-agent-marketplace
git pull --ff-only origin main
bash scripts/deploy-china-hk.sh
```

## 绑定域名

如果后面你买了域名，可以先做最简单的解析：

- 给域名添加 A 记录
- 指向中国香港服务器公网 IP

然后访问：

```text
http://你的域名
```

如果要 HTTPS，再补 Nginx / Caddy / 证书即可。

## 后续正式升级建议

如果你决定把展示版升级成更稳的正式版，建议下一步做：

- 数据库从 SQLite 升级到 MySQL 或 PostgreSQL
- 上传文件迁移到 COS / OSS
- AI 从 OpenAI 迁到国内模型
- 有大陆正式运营计划时再走备案与合规流程
