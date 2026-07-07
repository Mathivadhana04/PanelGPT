-- PanelGPT Database Schema
-- MySQL 8.0+ (UUID() as default supported)

CREATE DATABASE IF NOT EXISTS panelgpt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE panelgpt;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_color VARCHAR(7) DEFAULT '#6366F1',
  persona_preferences JSON DEFAULT ('["scientist","contrarian","visionary","philosopher","street_voice","satirist"]'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Debate sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  topic TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Debate messages table
CREATE TABLE IF NOT EXISTS debate_messages (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  persona_id VARCHAR(50) NOT NULL,
  persona_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  response_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES debate_sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON debate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON debate_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON debate_messages(session_id);
