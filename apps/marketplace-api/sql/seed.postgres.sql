-- 恒河沙智能体交易网 PostgreSQL / Supabase 示例数据
-- 请先执行 schema.postgres.sql，再执行本文件。

INSERT INTO users (
  email,
  password_hash,
  role,
  status,
  full_name,
  organization_name,
  phone,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES
  ('admin@henghesha.com', '$2a$10$.ovB/zVTPAq/0VVynbcvxuk3aSROm2IqPh0vMvoqKNItAuEFcviAa', 'admin', 'active', '平台管理员', '恒河沙平台', '13800000000', '', '负责平台审核、用户管理和支付确认。', '2026-04-12T10:00:00+08:00', '2026-04-12T10:00:00+08:00'),
  ('school@example.com', '$2a$10$.ovB/zVTPAq/0VVynbcvxuk3aSROm2IqPh0vMvoqKNItAuEFcviAa', 'school', 'active', '陈老师', '星河职业学院', '13900000001', '', '学校侧演示账户，可上传与管理智能体成果。', '2026-04-12T10:00:00+08:00', '2026-04-12T10:00:00+08:00'),
  ('enterprise@example.com', '$2a$10$.ovB/zVTPAq/0VVynbcvxuk3aSROm2IqPh0vMvoqKNItAuEFcviAa', 'enterprise', 'active', '周总', '远图科技', '13700000002', '', '企业侧演示账户，可发布需求和采购智能体。', '2026-04-12T10:00:00+08:00', '2026-04-12T10:00:00+08:00')
ON CONFLICT (email) DO NOTHING;

INSERT INTO agents (
  name,
  slug,
  summary,
  description,
  image_urls_json,
  demo_image_urls_json,
  file_url,
  price,
  category,
  status,
  school_id,
  prompt_template,
  conversation_template,
  featured,
  created_at,
  updated_at
)
SELECT
  '招生问答助手',
  '招生问答助手',
  '面向学校招生咨询的多轮问答智能体。',
  '支持专业推荐、报考条件说明、预约到访和家长常见问题解答。',
  '["/uploads/seed/admission-cover.svg","/uploads/seed/admission-secondary.svg"]'::jsonb,
  '["/uploads/seed/admission-demo.svg","/uploads/seed/admission-demo-2.svg"]'::jsonb,
  '',
  98000,
  '教育',
  'approved',
  id,
  '请以专业、可信、简洁的方式回答用户问题，并在最后给出下一步建议。',
  '1. 识别需求 2. 追问背景 3. 输出方案 4. 引导留资或转人工',
  TRUE,
  '2026-04-12T10:00:00+08:00',
  '2026-04-12T10:00:00+08:00'
FROM users
WHERE email = 'school@example.com'
  AND NOT EXISTS (SELECT 1 FROM agents WHERE slug = '招生问答助手');

INSERT INTO agents (
  name,
  slug,
  summary,
  description,
  image_urls_json,
  demo_image_urls_json,
  file_url,
  price,
  category,
  status,
  school_id,
  prompt_template,
  conversation_template,
  featured,
  created_at,
  updated_at
)
SELECT
  '企业售前顾问',
  '企业售前顾问',
  '面向企业客户接待和方案初筛的智能体。',
  '适用于企业官网、公众号和展会场景，可自动收集需求并推荐解决方案。',
  '["/uploads/seed/sales-cover.svg","/uploads/seed/sales-secondary.svg"]'::jsonb,
  '["/uploads/seed/sales-demo.svg","/uploads/seed/sales-demo-2.svg"]'::jsonb,
  '',
  168000,
  '企业',
  'approved',
  id,
  '请以专业、克制、商业顾问式的方式识别客户需求，并给出结构化建议。',
  '1. 判断客户类型 2. 追问应用场景 3. 给出方案建议 4. 引导留资或转人工',
  TRUE,
  '2026-04-12T10:00:00+08:00',
  '2026-04-12T10:00:00+08:00'
FROM users
WHERE email = 'school@example.com'
  AND NOT EXISTS (SELECT 1 FROM agents WHERE slug = '企业售前顾问');

INSERT INTO agents (
  name,
  slug,
  summary,
  description,
  image_urls_json,
  demo_image_urls_json,
  file_url,
  price,
  category,
  status,
  school_id,
  prompt_template,
  conversation_template,
  featured,
  created_at,
  updated_at
)
SELECT
  '文旅讲解官',
  '文旅讲解官',
  '适用于景区、博物馆和城市文旅场景的导览智能体。',
  '支持讲解脚本、路线推荐、活动介绍和游客问答。',
  '["/uploads/seed/culture-cover.svg","/uploads/seed/culture-secondary.svg"]'::jsonb,
  '["/uploads/seed/culture-demo.svg","/uploads/seed/culture-demo-2.svg"]'::jsonb,
  '',
  128000,
  '文旅',
  'approved',
  id,
  '请以亲和、可信、具有导览感的语气介绍景点或活动，并补充游玩建议。',
  '1. 识别游客需求 2. 推荐路线或项目 3. 提供讲解信息 4. 补充注意事项',
  FALSE,
  '2026-04-12T10:00:00+08:00',
  '2026-04-12T10:00:00+08:00'
FROM users
WHERE email = 'school@example.com'
  AND NOT EXISTS (SELECT 1 FROM agents WHERE slug = '文旅讲解官');

INSERT INTO orders (
  buyer_id,
  school_id,
  agent_id,
  title,
  description,
  note,
  attachment_url,
  budget,
  delivery_deadline,
  status,
  payment_status,
  created_at,
  updated_at
)
SELECT
  buyer.id,
  school.id,
  agent.id,
  '高校招生场景智能体采购',
  '希望围绕招生问答助手做官网和企微双端部署。',
  '请补充交付周期、知识库整理方式和后续运维建议。',
  '',
  120000,
  '2026-05-10',
  'pending',
  'submitted',
  '2026-04-12T10:00:00+08:00',
  '2026-04-12T10:00:00+08:00'
FROM users AS buyer
JOIN users AS school ON school.email = 'school@example.com'
JOIN agents AS agent ON agent.slug = '招生问答助手'
WHERE buyer.email = 'enterprise@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE title = '高校招生场景智能体采购'
      AND buyer_id = buyer.id
  );

INSERT INTO payments (
  order_id,
  pay_method,
  pay_status,
  pay_time,
  remark,
  created_at
)
SELECT
  id,
  'manual_transfer',
  'pending',
  NULL,
  '企业已提交线下支付回执，等待管理员确认。',
  '2026-04-12T10:05:00+08:00'
FROM orders
WHERE title = '高校招生场景智能体采购'
  AND NOT EXISTS (
    SELECT 1 FROM payments WHERE payments.order_id = orders.id
  );

INSERT INTO notifications (user_id, title, message, is_read, created_at)
SELECT
  id,
  '订单已创建',
  '订单已提交，等待平台审核支付与交付流程。',
  FALSE,
  '2026-04-12T10:05:00+08:00'
FROM users
WHERE email = 'enterprise@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications
    WHERE user_id = users.id
      AND title = '订单已创建'
  );

INSERT INTO notifications (user_id, title, message, is_read, created_at)
SELECT
  id,
  '收到新的订单请求',
  '订单已指向你的智能体，请尽快查看。',
  FALSE,
  '2026-04-12T10:05:00+08:00'
FROM users
WHERE email = 'school@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications
    WHERE user_id = users.id
      AND title = '收到新的订单请求'
  );

INSERT INTO audit_logs (target_table, target_id, action, admin_id, notes, timestamp)
SELECT
  'orders',
  orders.id,
  'seed_created',
  admin.id,
  '初始化演示订单与支付流程。',
  '2026-04-12T10:06:00+08:00'
FROM orders
JOIN users AS admin ON admin.email = 'admin@henghesha.com'
WHERE orders.title = '高校招生场景智能体采购'
  AND NOT EXISTS (
    SELECT 1
    FROM audit_logs
    WHERE target_table = 'orders'
      AND target_id = orders.id
      AND action = 'seed_created'
  );
