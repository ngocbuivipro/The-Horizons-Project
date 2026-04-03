#!/bin/bash

# Nhận tham số tag (mặc định latest)
TAG=${1:-latest}

echo "-------------------------------------------------------"
echo "🔥 VPS: Bắt đầu Deploy phiên bản: $TAG"
echo "-------------------------------------------------------"

# 1. Export biến môi trường IMAGE_TAG để docker-compose đọc
export IMAGE_TAG=$TAG

# 2. Pull image mới nhất về (Backend & Frontend)
docker compose pull

# 3. Dựng lại container (--force-recreate đảm bảo container restart để nhận env mới)
docker compose up -d --force-recreate --remove-orphans

# 4. Xóa image rác (image cũ không dùng nữa) để tiết kiệm ổ cứng VPS
docker image prune -f

echo "-------------------------------------------------------"
echo "✅ VPS: Deploy hoàn tất!"
echo "-------------------------------------------------------"