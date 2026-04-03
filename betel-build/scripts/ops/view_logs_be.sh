#!/bin/bash
source "$(dirname "$0")/../../config/env.sh"

echo "🔍 Đang kết nối log Backend (Nhấn Ctrl+C để thoát)..."
ssh -t "${REMOTE_USER}@${REMOTE_HOST}" "docker logs -f booking_backend"