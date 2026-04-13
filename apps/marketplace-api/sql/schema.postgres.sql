CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'school', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agents (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  image_urls_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  demo_image_urls_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  file_url TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
  school_id BIGINT NOT NULL REFERENCES users(id),
  prompt_template TEXT,
  conversation_template TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT NOT NULL REFERENCES users(id),
  school_id BIGINT REFERENCES users(id),
  agent_id BIGINT REFERENCES agents(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  note TEXT,
  attachment_url TEXT,
  budget INTEGER NOT NULL,
  delivery_deadline DATE,
  status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL CHECK(payment_status IN ('manual_pending', 'submitted', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pay_method TEXT NOT NULL,
  pay_status TEXT NOT NULL CHECK(pay_status IN ('pending', 'confirmed', 'rejected')),
  pay_time TIMESTAMPTZ,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  target_table TEXT NOT NULL,
  target_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  admin_id BIGINT NOT NULL REFERENCES users(id),
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
