#!/bin/bash
set -e # Dừng ngay lập tức nếu có lỗi

# 1. Load file cấu hình chung (Lưu ý đường dẫn tương đối)
source "$(dirname "$0")/../../config/env.sh"

# 2. Định nghĩa biến cho Backend
SERVICE_NAME="backend"               # Tên service trong docker-compose.yml
CONTAINER_NAME="booking_backend"     # Tên container thực tế đang chạy
BACKUP_IMAGE_NAME="backend_backup"   # Tên image backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)     # Dấu thời gian

echo "============================================================"
echo "🚀 START DEPLOY: $SERVICE_NAME"
echo "============================================================"

# --- BƯỚC 1: CẬP NHẬT CODE ---
log_info "[1/4] Đang kết nối VPS để Pull Code mới nhất..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PROJECT_DIR} && git fetch origin main && git reset --hard origin/main"

# --- BƯỚC 2: BACKUP CONTAINER CŨ (SNAPSHOT) ---
log_info "[2/4] Đang tạo bản Backup từ Container hiện tại..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "
    if docker ps --format '{{.Names}}' | grep -q '^${CONTAINER_NAME}$'; then
        echo '   --> Tìm thấy container ${CONTAINER_NAME}, đang backup...'
        docker commit ${CONTAINER_NAME} ${BACKUP_IMAGE_NAME}_${TIMESTAMP}
        echo '   --> ✅ Backup thành công: ${BACKUP_IMAGE_NAME}_${TIMESTAMP}'
    else
        echo '   --> ⚠️ Container chưa chạy hoặc không tồn tại. Bỏ qua backup.'
    fi
"

# --- BƯỚC 3: BUILD VÀ RESTART ---
log_info "[3/4] Build lại Image và Restart Container..."
# --no-deps: Không restart mongo hay frontend, chỉ restart backend
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PROJECT_DIR} && docker compose up -d --build --no-deps ${SERVICE_NAME}"

# --- BƯỚC 4: DỌN DẸP ---
log_info "[4/4] Dọn dẹp tài nguyên rác..."
# Xóa các image <none> nhưng GIỮ LẠI image backup vừa tạo
ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker image prune -f"

echo "============================================================"
log_success "✅ HOÀN TẤT: BACKEND ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG!"
echo "============================================================"
