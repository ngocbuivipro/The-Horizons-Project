#!/bin/bash

# Nhận tham số từ GitLab
# $1: Tag (dev/prod)
# $2: Environment Name (dev/prod)
TAG=$1
ENV_NAME=$2
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Đường dẫn (Sửa lại cho đúng user của bạn)
BASE_DIR="/home/betel-hospitability/betel-$ENV_NAME"
BACKUP_DIR="$BASE_DIR/backups"

echo "========================================================"
echo "VPS DEPLOY STARTED | Env: $ENV_NAME | Tag: $TAG"
echo "========================================================"

# 1. Di chuyển vào thư mục dự án
cd $BASE_DIR || { echo "Không tìm thấy thư mục $BASE_DIR"; exit 1; }

# 2. BACKUP DATABASE (Cực kỳ quan trọng)
echo "💾 [1/4] Đang Backup Database..."
mkdir -p "$BACKUP_DIR/db_$TIMESTAMP"

# Tìm container mongo đang chạy của môi trường này
MONGO_CONTAINER=$(docker compose ps -q mongo)

if [ -n "$MONGO_CONTAINER" ]; then
    # Dump dữ liệu
    docker exec $MONGO_CONTAINER sh -c 'mongodump --archive' > "$BACKUP_DIR/db_$TIMESTAMP/mongo_backup.archive"
    echo "Backup thành công tại: $BACKUP_DIR/db_$TIMESTAMP"
    
    # Xóa backup cũ (chỉ giữ 10 bản mới nhất)
    ls -dt "$BACKUP_DIR"/db_* | tail -n +11 | xargs -r rm -rf
else
    echo "Mongo Container không chạy, bỏ qua backup."
fi

# 3. PULL IMAGE MỚI
echo "⬇[2/4] Pulling Docker Images..."
# Xuất biến TAG để docker-compose.yml đọc được
export IMAGE_TAG=$TAG
docker compose pull

# 4. RESTART SERVICES
echo "[3/4] Recreating Containers..."
docker compose up -d --remove-orphans

# 5. DỌN DẸP
echo "🧹 [4/4] Cleaning up..."
docker image prune -f

# 6. HEALTH CHECK
echo "🔍 Checking status..."
sleep 5
if docker compose ps | grep -q "Up"; then
    echo "DEPLOY THÀNH CÔNG!"
else
    echo "CÓ LỖI XẢY RA! Container không chạy."
    docker compose ps
    exit 1
fi
