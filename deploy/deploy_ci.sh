#!/bin/bash

# Nhận tham số từ GitLab
TAG=$1
ENV_NAME=$2
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Xác định thư mục gốc dựa trên tham số ENV
if [ "$ENV_NAME" == "prod" ]; then
  BASE_DIR="/home/betel-hospitability/betel"
  MONGO_KEYWORD="betel_db_mongo" # Tên container mongo của prod
else
  BASE_DIR="/home/betel-hospitability/betel-dev"
  MONGO_KEYWORD="mongo_dev" # Tên container mongo của dev
fi

BACKUP_DIR="$BASE_DIR/backups"

echo "========================================================"
echo "🚀 VPS DEPLOY | Env: $ENV_NAME | Dir: $BASE_DIR"
echo "========================================================"

cd $BASE_DIR || { echo "❌ Sai đường dẫn: $BASE_DIR"; exit 1; }

# --- BACKUP DATABASE ---
echo "💾 Đang Backup Database..."
mkdir -p "$BACKUP_DIR/db_$TIMESTAMP"

# Tìm container ID dựa trên tên keyword
MONGO_CONTAINER=$(docker ps --format "{{.Names}}" | grep "$MONGO_KEYWORD" | head -n 1)

if [ -n "$MONGO_CONTAINER" ]; then
    echo "   👉 Found Mongo: $MONGO_CONTAINER"
    docker exec $MONGO_CONTAINER sh -c 'mongodump --archive' > "$BACKUP_DIR/db_$TIMESTAMP/backup.archive"
    echo "✅ Backup xong!"
else
    echo "⚠️ Không tìm thấy Mongo Container khớp với từ khóa '$MONGO_KEYWORD'. Bỏ qua Backup."
fi

# Xóa backup cũ
ls -dt "$BACKUP_DIR"/db_* | tail -n +6 | xargs -r rm -rf

# --- UPDATE CODE ---
echo "⬇️ Pulling & Restarting..."
export IMAGE_TAG=$TAG
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f

echo "✅ HOÀN TẤT!"