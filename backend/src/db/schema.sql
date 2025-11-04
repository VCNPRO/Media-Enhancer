-- Media Enhancer Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (básica, Clerk maneja la auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  tier VARCHAR(20) NOT NULL, -- 'starter', 'creator', 'professional'
  price_monthly INTEGER NOT NULL, -- en centavos
  price_yearly INTEGER,
  features JSONB NOT NULL,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media files table
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- en bytes
  mime_type VARCHAR(100) NOT NULL,
  duration INTEGER, -- en segundos
  resolution VARCHAR(20), -- '1920x1080', '3840x2160', etc
  storage_key VARCHAR(500) NOT NULL, -- R2 key
  storage_url TEXT NOT NULL, -- URL pública o firmada
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'ready', -- 'uploading', 'ready', 'processing', 'error'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  media_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  settings JSONB, -- configuración del proyecto (cortes, efectos, etc)
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'processing', 'completed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exports table
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  format VARCHAR(50) NOT NULL, -- 'mp4', 'mov', 'webm', etc
  resolution VARCHAR(20),
  file_size BIGINT,
  storage_key VARCHAR(500),
  storage_url TEXT,
  status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI enhancement jobs
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- 'denoise', 'upscale', 'colorgrade', etc
  parameters JSONB,
  status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  progress INTEGER DEFAULT 0,
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exports_updated_at BEFORE UPDATE ON exports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes por defecto
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, features, stripe_price_id_monthly, stripe_price_id_yearly)
VALUES
  ('Starter', 'starter', 0, 0,
   '{"storage": "5GB", "projects": 10, "exports": 50, "maxDuration": 300, "aiEnhancements": false, "watermark": true}'::jsonb,
   NULL, NULL),
  ('Creator', 'creator', 1499, 14400,
   '{"storage": "50GB", "projects": 100, "exports": 500, "maxDuration": 1800, "aiEnhancements": true, "watermark": false}'::jsonb,
   'price_creator_monthly', 'price_creator_yearly'),
  ('Professional', 'professional', 4999, 48000,
   '{"storage": "500GB", "projects": "unlimited", "exports": "unlimited", "maxDuration": 7200, "aiEnhancements": true, "watermark": false, "prioritySupport": true}'::jsonb,
   'price_pro_monthly', 'price_pro_yearly')
ON CONFLICT DO NOTHING;
