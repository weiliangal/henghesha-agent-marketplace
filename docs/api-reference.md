# 恒河沙智能体交易网 API 文档

基础地址：

- 本地开发：`http://127.0.0.1:4000/api`
- 生产环境：`https://你的后端域名/api`

认证方式：

- 登录成功后返回 JWT。
- 前端将 JWT 存储到 `localStorage`。
- 需要鉴权的接口通过 `Authorization: Bearer <token>` 传递。

## 1. 认证接口

### POST `/auth/register`

注册用户。

请求体：

```json
{
  "email": "new-school@example.com",
  "password": "password123",
  "role": "school",
  "fullName": "李老师",
  "organizationName": "云桥学院",
  "phone": "13600000000",
  "bio": "负责智能体项目孵化"
}
```

返回：

- `token`
- `user`

### POST `/auth/login`

登录并获取 JWT。

请求体：

```json
{
  "email": "enterprise@example.com",
  "password": "password123"
}
```

### GET `/auth/me`

读取当前登录用户。

### GET `/auth/profile`

兼容别名，返回内容与 `/auth/me` 一致。

## 2. 用户中心接口

### GET `/users/me`

返回用户资料。

### PATCH `/users/me`

更新个人资料。

请求体：

```json
{
  "fullName": "周总",
  "organizationName": "远图科技",
  "phone": "13700009999",
  "bio": "企业数字化与 AI 应用负责人",
  "avatarUrl": ""
}
```

### PATCH `/users/me/password`

修改密码。

请求体：

```json
{
  "currentPassword": "password123",
  "newPassword": "password456"
}
```

## 3. 智能体接口

### GET `/agents`

查询智能体列表。

支持查询参数：

- `search`
- `category`
- `featured=true`
- `status`
- `mine=true`

说明：

- 访客默认只能看到 `approved` 智能体。
- `mine=true` 仅学校用户可查询自己的智能体。

### GET `/agents/:id`

读取智能体详情。

### POST `/agents`

学校用户上传智能体。

请求类型：

- `multipart/form-data`

字段：

- `name`
- `summary`
- `description`
- `price`
- `category`
- `promptTemplate`
- `conversationTemplate`
- `images[]`
- `demoImages[]`
- `agentFile`

说明：

- 新建智能体默认进入 `pending` 审核状态。

### PATCH `/agents/:id`

学校用户可编辑自己的智能体，管理员可编辑任意智能体。

常用字段：

- `name`
- `summary`
- `description`
- `price`
- `category`
- `promptTemplate`
- `conversationTemplate`
- `status`
- `featured`
- `existingImageUrls`
- `existingDemoImageUrls`

### DELETE `/agents/:id`

学校用户可删除自己的智能体，管理员可删除任意智能体。

## 4. 订单接口

### GET `/orders`

查询订单列表。

返回规则：

- 企业用户：仅返回自己创建的订单。
- 学校用户：返回分配到自己的订单。
- 管理员：返回全部订单。

### GET `/orders/:id`

读取订单详情。

### POST `/orders`

企业用户创建订单。

请求类型：

- `multipart/form-data`

字段：

- `title`
- `description`
- `budget`
- `deliveryDeadline`
- `agentId`
- `note`
- `attachment`

### PATCH `/orders/:id`

更新订单状态或补充信息。

常见场景：

- 企业提交支付回执：`paymentStatus = submitted`
- 学校标记交付完成：`status = completed`
- 管理员确认支付：`paymentStatus = confirmed`，同时可更新 `status = paid`

### DELETE `/orders/:id`

管理员删除订单。

## 5. 管理后台接口

### GET `/admin/stats`

返回管理后台首页统计数据。

### GET `/admin/users`

返回全部用户列表。

### PATCH `/admin/users/:id/status`

修改用户状态。

请求体：

```json
{
  "status": "disabled"
}
```

### DELETE `/admin/users/:id`

删除用户。

限制：

- 不允许删除管理员账户。
- 若用户仍有关联智能体或订单，则不允许删除。

### GET `/admin/agents`

返回全部智能体，支持管理员审核。

### PATCH `/admin/agents/:id`

管理员直接修改智能体。

字段：

- `status`
- `featured`
- `notes`

### PATCH `/admin/agents/:id/status`

管理员快速审核智能体状态。

### GET `/admin/orders`

返回全部订单。

### PATCH `/admin/orders/:id`

管理员修改订单状态和支付状态。

字段：

- `status`
- `paymentStatus`
- `payMethod`
- `remark`

### PATCH `/admin/orders/:id/status`

管理员快速修改订单状态。

### GET `/admin/audit-logs`

返回最近审核日志。

## 6. 站点数据接口

### GET `/site/overview`

返回首页概览数据，例如推荐智能体和案例模块数据。

### GET `/site/templates`

返回模板中心列表。

## 7. 通知接口

### GET `/notifications`

返回当前用户通知列表和未读数。

### PATCH `/notifications/:id/read`

将单条通知标记为已读。

### PATCH `/notifications/read-all`

将当前用户全部通知标记为已读。

## 8. OpenAI 接口

### POST `/openai/generate`

根据需求描述生成智能体草案。

请求体：

```json
{
  "requirement": "为职业院校生成一个招生咨询智能体",
  "type": "education",
  "parameters": {
    "tone": "professional",
    "channel": "website"
  }
}
```

返回字段：

- `name`
- `summary`
- `description`
- `promptTemplate`
- `conversationTemplate`
- `recommendedPrice`
- `suggestedCategory`

说明：

- 若未配置 `OPENAI_API_KEY`，接口会返回本地 mock 结果，方便演示。

## 9. 常见状态值

角色：

- `admin`
- `school`
- `enterprise`

智能体状态：

- `pending`
- `approved`
- `rejected`

订单状态：

- `pending`
- `paid`
- `completed`
- `cancelled`

支付状态：

- `manual_pending`
- `submitted`
- `confirmed`
- `rejected`
