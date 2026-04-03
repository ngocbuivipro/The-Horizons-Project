#!/bin/bash
set -e
source "$(dirname "$0")/../../config/env.sh"

# Định nghĩa biến cho Frontend
SERVICE_NAME="frontend"
CONTAINER_NAME="booking_frontend"
BACKUP_IMAGE_NAME="frontend_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "============================================================"
echo "🚀 START DEPLOY: $SERVICE_NAME"
echo "============================================================"

log_info "[1/4] Pull Code mới nhất..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PROJECT_DIR} && git fetch origin main && git reset --hard origin/main"

log_info "[2/4] Backup Container Frontend cũ..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "
    if docker ps --format '{{.Names}}' | grep -q '^${CONTAINER_NAME}$'; then
        docker commit ${CONTAINER_NAME} ${BACKUP_IMAGE_NAME}_${TIMESTAMP}
        echo '   --> ✅ Backup thành công: ${BACKUP_IMAGE_NAME}_${TIMESTAMP}'
    else
        echo '   --> ⚠️ Bỏ qua backup (Container chưa chạy).'
    fi
"

log_info "[3/4] Build và Restart Frontend..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PROJECT_DIR} && docker compose up -d --build --no-deps ${SERVICE_NAME}"

log_info "[4/4] Dọn dẹp..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker image prune -f"

echo "============================================================"
log_success "✅ HOÀN TẤT: FRONTEND ĐÃ SẴN SÀNG!"
echo "============================================================"