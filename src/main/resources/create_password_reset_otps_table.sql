-- Tạo bảng password_reset_otps
-- Chạy script này nếu Hibernate ddl-auto không tự tạo bảng

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  otp_hash VARCHAR(200) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  used TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_user_expires (user_id, expires_at),
  INDEX idx_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
