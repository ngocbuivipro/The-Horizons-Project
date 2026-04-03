#!/bin/bash

# ================= CẤU HÌNH =================
# Thư mục chứa file backup trên VPS
BACKUP_DIR="/home/betel-hospitability/backups/database"
# Tên container Database đang chạy (Dùng lệnh 'docker ps' để xem tên chính xác)
DB_CONTAINER_NAME="betel_mongodb" 
# Tên Database cần backup
DB_NAME="betel_db"
# Thời gian hiện tại để đặt tên file
DATE=$(date +%Y-%m-%d_%H-%M)

# Tạo thư mục backup nếu chưa có
mkdir -p $BACKUP_DIR

echo "[$(date)] Bắt đầu backup database..."

# ================= LỆNH BACKUP (CHỌN 1 TRONG CÁC LOẠI DƯỚI) =================

# --- OPTION A: MONGODB (Mặc định cho Node.js) ---
# Lệnh này dump dữ liệu từ container ra file nén
docker exec $DB_CONTAINER_NAME mongodump --db $DB_NAME --archive --gzip > "$BACKUP_DIR/db_$DATE.gz"

# --- OPTION B: MYSQL (Bỏ comment nếu dùng MySQL) ---
# DB_USER="root"
# DB_PASS="password_cua_ban"
# docker exec $DB_CONTAINER_NAME /usr/bin/mysqldump -u $DB_USER --password=$DB_PASS $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# --- OPTION C: POSTGRESQL (Bỏ comment nếu dùng Postgres) ---
# DB_USER="postgres"
# docker exec -t $DB_CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# ================= KIỂM TRA & DỌN DẸP =================

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Backup thành công: db_$DATE.gz"
else
  echo "[$(date)] ❌ Backup thất bại!"
  # Gửi thông báo lỗi qua Telegram/Email ở đây nếu cần
  exit 1
fi

# Xóa các bản backup cũ hơn 7 ngày để tiết kiệm dung lượng
find $BACKUP_DIR -type f -mtime +7 -name "*.gz" -delete
echo "[$(date)] Đã dọn dẹp các file backup cũ hơn 7 ngày."
