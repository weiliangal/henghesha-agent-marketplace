# 中国展示版部署说明

这份文档面向“让中国大陆用户更容易打开演示站”的场景，推荐使用中国香港服务器进行单机部署。

## 适用场景

- 你想尽快给中国大陆客户、朋友或合作方展示网站。
- 你暂时不准备走中国大陆 ICP 备案。
- 你希望前后端用同一个 IP 或同一个域名访问，避免跨域和多平台部署。

这套方案属于“香港展示版”，不是中国大陆正式合规经营版。

## 推荐云服务

优先选择：

- 腾讯云轻量应用服务器中国香港
- 阿里云 ECS 中国香港

公开资料说明，中国大陆网站如果部署在中国大陆服务器，通常需要 ICP 备案；中国香港服务器不属于中国大陆备案范围，更适合快速演示。

参考：

- [腾讯云备案概述](https://cloud.tencent.com/document/product/243)
- [阿里云备案帮助](https://help.aliyun.com/zh/icp-filing/)

## 部署结构

当前仓库已经支持：

- 前端构建后由后端同域提供
- 后端继续提供 `/api/*` 和 `/uploads/*`
- Docker 单容器运行
- 使用 SQLite 持久化演示数据

核心文件：

- [Dockerfile.china-hk](C:/Users/william/Documents/New%20project/Dockerfile.china-hk)
- [docker-compose.china-hk.yml](C:/Users/william/Documents/New%20project/docker-compose.china-hk.yml)

## 服务器要求

- Ubuntu 22.04 或 24.04
- 至少 2 核 2G
- 开放端口：`22`, `80`

如果后续要绑定域名并启用 HTTPS，再额外开放：

- `443`

## 部署步骤

### 1. 登录服务器

```bash
ssh root@你的服务器IP
```

### 2. 安装 Docker 与 Docker Compose

Ubuntu 常见安装方式：

```bash
apt update
apt install -y docker.io docker-compose-v2 git
systemctl enable docker
systemctl start docker
```

### 3. 拉取代码

```bash
git clone https://github.com/weiliangal/henghesha-agent-marketplace.git
cd henghesha-agent-marketplace
```

### 4. 修改部署变量

编辑：

```bash
vim docker-compose.china-hk.yml
```

至少改这两项：

- `JWT_SECRET`
- `OPENAI_API_KEY`，如果暂时没有可以留空

说明：

- `OPENAI_API_KEY` 留空时，系统会返回本地 mock 结果，适合演示
- 当前前后端同域部署，不强依赖额外配置 `CLIENT_ORIGIN`

### 5. 启动服务

```bash
docker compose -f docker-compose.china-hk.yml up -d --build
```

### 6. 检查运行状态

```bash
docker compose -f docker-compose.china-hk.yml ps
docker compose -f docker-compose.china-hk.yml logs -f
```

### 7. 访问网站

浏览器直接打开：

```text
http://你的服务器IP
```

健康检查：

```text
http://你的服务器IP/api/health
```

## 数据持久化

`docker-compose.china-hk.yml` 已经把这两类数据挂到宿主机：

- 数据库：`./deploy/china-hk/data`
- 上传文件：`./deploy/china-hk/uploads`

这样即使容器重建，数据也不会丢。

## 绑定域名

如果你后面购买了域名，可以把域名 A 记录解析到中国香港服务器 IP。

最简单的两种用法：

- 先直接用 `http://域名`
- 后续再补 `Nginx / Caddy + HTTPS`

## 生产前建议

如果后面要做正式商用，建议继续升级：

- 数据库从 SQLite 升级到 MySQL / PostgreSQL
- 上传文件迁到 COS / OSS
- AI 从 OpenAI 切到国内模型，例如通义千问或腾讯混元
- 如果迁到中国大陆服务器，则走 ICP 备案流程

## 当前方案的优势

- 比 Vercel + Render 更适合中国大陆演示访问
- 只需要一台香港服务器
- 前后端同域，链路简单
- 迁移成本低，后面还能继续升级到正式版
