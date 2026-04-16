# 香港展示版绑定域名

适用于已经在腾讯云中国香港轻量服务器上部署好“恒河沙智能体交易网”的场景。

## 目标

- 用域名访问，而不是直接用 IP
- 自动启用 HTTPS
- 提升手机浏览器、微信内置浏览器和桌面浏览器的访问体验

## 先做 DNS 解析

如果你的域名是 `10e52.com`，在 DNSPod / 腾讯云域名解析里添加：

1. `A` 记录
   - 主机记录：`@`
   - 记录值：`43.129.75.40`

2. `CNAME` 记录
   - 主机记录：`www`
   - 记录值：`10e52.com`

也可以把 `www` 直接做成 `A` 记录指向同一个 IP。

## 防火墙

除了已有的 `80` 端口，再放通：

- `443`

## 服务器执行命令

登录到香港服务器后执行：

```bash
cd /opt/henghesha-agent-marketplace
git pull --ff-only origin main
bash scripts/enable-china-hk-domain.sh 10e52.com
```

如果你想给证书登记邮箱，也可以这样执行：

```bash
bash scripts/enable-china-hk-domain.sh 10e52.com your-email@example.com
```

## 运行方式

这套方案会：

- 保持 Node 应用继续运行在容器内
- 用 Caddy 作为反向代理
- 自动申请和续期 HTTPS 证书
- 对静态资源启用压缩

## 完成后访问

- `https://10e52.com`

如 DNS 刚改完，通常等待几分钟到十几分钟再刷新。
