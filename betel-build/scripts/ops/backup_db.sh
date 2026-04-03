#!/bin/bash
source "$(dirname "$0")/../../config/env.sh"

log_info "📦 Gửi lệnh Backup Database..."
# Giả định bạn đã tạo file backup_db.sh trên VPS theo hướng dẫn trước
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PROJECT_DIR} && ./backup_db.sh"
log_success "✅ Đã thực hiện xong lệnh backup."