CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'school', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  image_urls_json TEXT NOT NULL,
  demo_image_urls_json TEXT NOT NULL,
  file_url TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
  school_id INTEGER NOT NULL,
  prompt_template TEXT,
  conversation_template TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (school_id) REFERENCES users(id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  school_id INTEGER,
  agent_id INTEGER,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  note TEXT,
  attachment_url TEXT,
  budget INTEGER NOT NULL,
  delivery_deadline TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL CHECK(payment_status IN ('manual_pending', 'submitted', 'confirmed', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (school_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  pay_method TEXT NOT NULL,
  pay_status TEXT NOT NULL CHECK(pay_status IN ('pending', 'confirmed', 'rejected')),
  pay_time TEXT,
  remark TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_table TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  admin_id INTEGER NOT NULL,
  notes TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
