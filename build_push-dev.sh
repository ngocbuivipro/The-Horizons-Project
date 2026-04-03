#!/bin/bash

ENV_MODE="dev"
DOCKER_TAG="dev"
REQUIRED_BRANCH="develop" # <--- REQUIRED DEV BRANCH
REMOTE_DIR="/home/betel-hospitability/betel-dev"
LOCAL_COMPOSE_FILE="deploy/docker-compose.dev.yml"
REMOTE_COMPOSE_FILE="docker-compose.yaml"

# --- General Info ---
REMOTE_USER="root"
REMOTE_HOST="116.118.48.142"
REMOTE_DEPLOY_SCRIPT="./deploy.sh"
DOCKER_USER="traitimtrongvang10"
BACKEND_REPO="betel-backend"
FRONTEND_REPO="betel-frontend"
BACKUP_DIR="./backups/dev"

# --- API URL FOR DEV ENVIRONMENT (IMPORTANT) ---
DEV_API_URL="https://api-dev.betelhospitality.com/api"

# --- Colors ---
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[DEV] $1${NC}"; }
log_success() { echo -e "${GREEN}[DEV] $1${NC}"; }
log_error() { echo -e "${RED}[DEV] $1${NC}"; }
log_backup() { echo -e "${PURPLE}[BACKUP] $1${NC}"; }

# ================= 1. CHECK BRANCH FUNCTION (STRICT CHECK) =================
check_branch() {
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
        echo "---------------------------------------------------------------"
        log_error "STRICTLY FORBIDDEN: You are on branch '$CURRENT_BRANCH'."
        log_error "DEV environment requires building from branch '$REQUIRED_BRANCH'."
        echo "Please run: git checkout $REQUIRED_BRANCH"
        echo "---------------------------------------------------------------"
        exit 1
    fi
    log_success "Valid branch checked: $CURRENT_BRANCH"
}

# ================= 2. BACKUP FUNCTION =================
perform_backup() {
    echo ""
    log_backup "Creating source code backup..."

    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    FILE_NAME="backup_dev_${TIMESTAMP}.tar.gz"
    FILE_PATH="$BACKUP_DIR/$FILE_NAME"

    tar -czf "$FILE_PATH" \
        --exclude='node_modules' --exclude='.git' --exclude='backups' \
        --exclude='dist' --exclude='build' --exclude='.idea' .

    if [ $? -eq 0 ]; then
        log_success "Backup successful: $FILE_NAME"
    else
        log_error "Backup failed."
        return
    fi

    # Remove old (keep newest 10 files)
    COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    if [ "$COUNT" -gt 10 ]; then
        log_backup "Cleaning up old backups..."
        ls -1tr "$BACKUP_DIR"/*.tar.gz | head -n 5 | xargs rm -f
    fi
}

# ================= 3. UPLOAD CONFIGS (FIXED: NO SCP) =================
upload_configs() {
    log_info "Syncing configs to VPS..."

    # 1. Đảm bảo thư mục tồn tại
    ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

    # 2. Upload Backend config (Dùng cat | ssh để tránh lỗi Banner VPS)
    if [ ! -f "envs/backend.dev.env" ]; then log_error "Missing file envs/backend.dev.env"; exit 1; fi
    log_info "Uploading backend.env..."

    cat "envs/backend.dev.env" | ssh $REMOTE_USER@$REMOTE_HOST "cat > $REMOTE_DIR/backend.env"

    if [ $? -ne 0 ]; then log_error "Failed to upload backend.dev.env"; exit 1; fi

    # 3. Upload docker-compose (Dùng cat | ssh)
    if [ ! -f "$LOCAL_COMPOSE_FILE" ]; then log_error "Missing file $LOCAL_COMPOSE_FILE"; exit 1; fi
    log_info "Uploading docker-compose.yaml..."

    cat "$LOCAL_COMPOSE_FILE" | ssh $REMOTE_USER@$REMOTE_HOST "cat > $REMOTE_DIR/$REMOTE_COMPOSE_FILE"

    if [ $? -ne 0 ]; then log_error "Failed to upload docker-compose file"; exit 1; fi

    log_success "All configuration files uploaded successfully."
}

# ================= 4. BUILD & DEPLOY FUNCTIONS =================
build_backend() {
    log_info "STARTING BACKEND BUILD..."
    docker build --platform linux/amd64 -t $DOCKER_USER/$BACKEND_REPO:$DOCKER_TAG ./backend
    docker push $DOCKER_USER/$BACKEND_REPO:$DOCKER_TAG
    log_success "Backend finished."
}

build_frontend() {
    log_info "STARTING FRONTEND BUILD..."
    log_info "Injecting VITE_BASE_URI: $DEV_API_URL"

    docker build --platform linux/amd64 \
        --build-arg VITE_BASE_URI="$DEV_API_URL" \
        -t $DOCKER_USER/$FRONTEND_REPO:$DOCKER_TAG \
        ./frontend

    if [ $? -ne 0 ]; then log_error "Frontend build error"; exit 1; fi

    docker push $DOCKER_USER/$FRONTEND_REPO:$DOCKER_TAG
    log_success "Frontend finished."
}

trigger_deploy() {
    log_info "Calling VPS Deploy..."

    # FIX: Truyền biến IMAGE_TAG trực tiếp để tránh lỗi "invalid reference format"
    ssh -t $REMOTE_USER@$REMOTE_HOST \
        "cd $REMOTE_DIR && IMAGE_TAG=$DOCKER_TAG docker compose -f $REMOTE_COMPOSE_FILE up -d --pull always --force-recreate"

    if [ $? -eq 0 ]; then
        log_success "DEV DEPLOY SUCCESSFUL!"
        perform_backup
    else
        log_error "Deploy failed."
    fi
}

update_config_only() {
    # upload_configs is run BEFORE this
    log_info "Restarting backend container on VPS to apply new env..."

    # FIX: Truyền biến IMAGE_TAG
    ssh -t $REMOTE_USER@$REMOTE_HOST \
        "cd $REMOTE_DIR && IMAGE_TAG=$DOCKER_TAG docker compose -f $REMOTE_COMPOSE_FILE up -d --force-recreate backend"

    if [ $? -eq 0 ]; then
        log_success "Config updated and backend restarted successfully!"
    else
        log_error "Failed to restart backend after config update."
        exit 1
    fi
}

# ================= MENU =================
# Check branch immediately
check_branch

echo "---------------------------------------------"
echo "DEVELOPMENT DEPLOY MENU (Branch: $REQUIRED_BRANCH)"
echo "---------------------------------------------"
echo "   1) Build Backend Only (+ Upload Config + Deploy)"
echo "   2) Build Frontend Only (+ Upload Config + Deploy)"
echo "   3) Both (+ Upload Config + Deploy)"
echo "   4) Update Config/Env Only (no rebuild, restart backend)"
echo "---------------------------------------------"
read -p "Your choice (1-4): " CHOICE

# Luôn chạy upload_configs trước
case $CHOICE in
    1) upload_configs; build_backend; trigger_deploy ;;
    2) upload_configs; build_frontend; trigger_deploy ;;
    3) upload_configs; build_backend; build_frontend; trigger_deploy ;;
    4) upload_configs; update_config_only ;;
    *) log_error "Invalid choice."; exit 1 ;;
esac