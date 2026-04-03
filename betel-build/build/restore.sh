#!/bin/bash

# ================= CẤU HÌNH (CONFIG) =================
# --- Thông tin VPS ---
REMOTE_USER="root"
REMOTE_HOST="116.118.48.142"
REMOTE_PROJECT_DIR="/home/betel-hospitability/betel"

# --- Thông tin Docker ---
DOCKER_USER="traitimtrongvang10"
BACKEND_REPO="betel-backend"
FRONTEND_REPO="betel-frontend"
TAG_LATEST="latest"
TAG_BACKUP="backup"

# --- Màu sắc ---
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[RESTORE] ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}[RESTORE] ✅ $1${NC}"; }
log_error() { echo -e "${RED}[RESTORE] ❌ $1${NC}"; }

# ================= MENU LỰA CHỌN =================
echo "---------------------------------------------"
echo "🚑 KHẨN CẤP: BẠN MUỐN KHÔI PHỤC (ROLLBACK) SERVICE NÀO?"
echo "   1) Backend (API)"
echo "   2) Frontend (Web)"
echo "   3) Cả hai"
echo "---------------------------------------------"
read -p "👉 Nhập số (1-3): " CHOICE

# Xác định service cần restore
case $CHOICE in
    1) TARGETS="backend";;
    2) TARGETS="frontend";;
    3) TARGETS="backend frontend";;
    *) log_error "Lựa chọn không hợp lệ."; exit 1 ;;
esac

# ================= TẠO LỆNH XỬ LÝ TRÊN VPS =================
# Chúng ta sẽ gửi một chuỗi lệnh dài để chạy trên VPS
REMOTE_COMMANDS=""

# Di chuyển vào thư mục dự án
REMOTE_COMMANDS+="cd $REMOTE_PROJECT_DIR && "

for TARGET in $TARGETS; do
    if [ "$TARGET" == "backend" ]; then
        REPO=$BACKEND_REPO
        SERVICE_NAME="backend" # Tên service trong docker-compose.yml (kiểm tra lại tên này!)
    else
        REPO=$FRONTEND_REPO
        SERVICE_NAME="frontend" # Tên service trong docker-compose.yml
    fi

    echo ""
    log_info "Đang chuẩn bị lệnh restore cho: $TARGET..."

    # 1. Pull bản backup về
    REMOTE_COMMANDS+="echo '⬇️  Đang tải bản backup cho $TARGET...' && "
    REMOTE_COMMANDS+="docker pull $DOCKER_USER/$REPO:$TAG_BACKUP && "

    # 2. Gán tag backup thành latest (đè lên bản lỗi hiện tại)
    REMOTE_COMMANDS+="echo '🏷️  Đang kích hoạt bản backup...' && "
    REMOTE_COMMANDS+="docker tag $DOCKER_USER/$REPO:$TAG_BACKUP $DOCKER_USER/$REPO:$TAG_LATEST && "

    # 3. Khởi động lại container (Force recreate để nhận image mới gán)
    # Lưu ý: Lệnh này giả định bạn dùng docker-compose. Nếu dùng docker swarm, lệnh sẽ khác.
    REMOTE_COMMANDS+="echo '🔄 Đang khởi động lại $TARGET...' && "
    REMOTE_COMMANDS+="docker-compose up -d --force-recreate --no-deps $SERVICE_NAME && "
done

REMOTE_COMMANDS+="echo '✅ Đã hoàn tất Rollback!'"

# ================= THỰC THI SSH =================
echo ""
log_info "Đang kết nối tới VPS ($REMOTE_HOST) để thực thi Rollback..."
ssh -t $REMOTE_USER@$REMOTE_HOST "$REMOTE_COMMANDS"

if [ $? -eq 0 ]; then
    log_success "Đã khôi phục phiên bản cũ thành công!"
else
    log_error "Có lỗi xảy ra trong quá trình restore."
fi