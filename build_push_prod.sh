#!/bin/bash

# ================= PRODUCTION CONFIGURATION =================
ENV_MODE="prod"
DOCKER_TAG="latest"
REQUIRED_BRANCH="main" # <--- MAIN BRANCH REQUIRED
REMOTE_DIR="/home/betel-hospitability/betel"
LOCAL_COMPOSE_FILE="deploy/docker-compose.prod.yml"
REMOTE_COMPOSE_FILE="docker-compose.yaml"

# --- General information ---
REMOTE_USER="root"
REMOTE_HOST="116.118.48.142"
REMOTE_DEPLOY_SCRIPT="./deploy.sh"
DOCKER_USER="traitimtrongvang10"
BACKEND_REPO="betel-backend"
FRONTEND_REPO="betel-frontend"
BACKUP_DIR="./backups/prod"

# --- Colors ---
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}[PROD] INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}[PROD] SUCCESS: $1${NC}"
}

log_error() {
    echo -e "${RED}[PROD] ERROR: $1${NC}"
}

log_backup() {
    echo -e "${PURPLE}[BACKUP] $1${NC}"
}

# ================= 1. STRICT BRANCH CHECK =================
check_branch() {
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

    if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
        echo "---------------------------------------------------------------"
        log_error "FORBIDDEN: You are currently on branch '$CURRENT_BRANCH'."
        log_error "PRODUCTION environment must be built from '$REQUIRED_BRANCH'."
        echo "Please run: git checkout $REQUIRED_BRANCH"
        echo "---------------------------------------------------------------"
        exit 1
    fi

    log_success "Valid branch verified: $CURRENT_BRANCH"
}

# ================= 2. BACKUP FUNCTION =================
perform_backup() {
    echo ""
    log_backup "Creating source code backup..."

    # 1. Create directory
    mkdir -p "$BACKUP_DIR"

    # 2. Define file name (.tar.gz instead of .zip)
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

    if [ "$ENV_MODE" == "prod" ]; then
        FILE_NAME="backup_prod_${TIMESTAMP}.tar.gz"
    else
        FILE_NAME="backup_dev_${TIMESTAMP}.tar.gz"
    fi

    FILE_PATH="$BACKUP_DIR/$FILE_NAME"

    # 3. Compress using TAR (exclude unnecessary folders)
    # Note: --exclude parameters must be placed before the dot (.)
    tar -czf "$FILE_PATH" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='backups' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.idea' \
        .

    if [ $? -eq 0 ]; then
        log_success "Backup completed: $FILE_NAME"
    else
        log_error "Backup failed."
        return
    fi

    # 4. Cleanup old backups (keep latest 10 files)
    COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)

    if [ "$COUNT" -gt 10 ]; then
        log_backup "Cleaning up old backups..."
        ls -1tr "$BACKUP_DIR"/*.tar.gz | head -n 5 | xargs rm -f
    fi
}

# ================= 3. MAIN OPERATIONS =================
upload_configs() {
    log_info "Synchronizing configuration files & scripts to VPS..."

    # [NEW] 1. Kiểm tra và Tự động tạo thư mục trên server nếu chưa có
    log_info "Checking remote directory..."
    ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

    # [ENV] 2. Upload Env Backend
    if [ ! -f "envs/backend.prod.env" ]; then
        log_error "Missing file: envs/backend.prod.env"
        exit 1
    fi
    # Upload và đổi tên thành backend.env trên server
    scp "envs/backend.prod.env" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/backend.env"

    # [COMPOSE] 3. Upload Docker Compose
    if [ ! -f "$LOCAL_COMPOSE_FILE" ]; then
        log_error "Missing file: $LOCAL_COMPOSE_FILE"
        exit 1
    fi
    scp "$LOCAL_COMPOSE_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/$REMOTE_COMPOSE_FILE"

    # [SCRIPT] 4. Upload file deploy.sh (QUAN TRỌNG: Khôi phục file đã mất)
    LOCAL_DEPLOY_SCRIPT="deploy/deploy.sh" # Đường dẫn file ở máy local của bạn
    
    if [ ! -f "$LOCAL_DEPLOY_SCRIPT" ]; then
        log_error "Missing file locally: $LOCAL_DEPLOY_SCRIPT"
        log_error "Please create deploy/deploy.sh before running."
        exit 1
    fi

    scp "$LOCAL_DEPLOY_SCRIPT" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/deploy.sh"

    # [PERM] 5. Cấp quyền thực thi cho script trên server
    ssh $REMOTE_USER@$REMOTE_HOST "chmod +x $REMOTE_DIR/deploy.sh"
    
    log_success "All configurations and scripts restored on VPS."
}

build_backend() {
    log_info "STARTING BACKEND BUILD..."

    docker build --platform linux/amd64 -t $DOCKER_USER/$BACKEND_REPO:$DOCKER_TAG ./backend
    docker push $DOCKER_USER/$BACKEND_REPO:$DOCKER_TAG

    log_success "Backend build completed."
}

build_frontend() {
    log_info "STARTING FRONTEND BUILD..."

    if [ ! -f "envs/frontend.prod.env" ]; then
        log_error "Missing file: envs/frontend.prod.env"
        exit 1
    fi

    cp "envs/frontend.prod.env" "frontend/.env"

    docker build --platform linux/amd64 -t $DOCKER_USER/$FRONTEND_REPO:$DOCKER_TAG ./frontend
    res=$?

    rm "frontend/.env"

    if [ $res -ne 0 ]; then
        log_error "Frontend build failed."
        exit 1
    fi

    docker push $DOCKER_USER/$FRONTEND_REPO:$DOCKER_TAG
    log_success "Frontend build completed."
}

trigger_deploy() {
    log_info "Triggering VPS deploy..."

    ssh -t $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && bash $REMOTE_DEPLOY_SCRIPT $DOCKER_TAG"

    if [ $? -eq 0 ]; then
        log_success "PRODUCTION DEPLOY SUCCESSFUL!"
        perform_backup
    else
        log_error "Deploy failed."
    fi
}

# ================= EXECUTION =================
check_branch

echo "---------------------------------------------"
echo "PRODUCTION DEPLOY MENU (Branch: $REQUIRED_BRANCH)"
echo "---------------------------------------------"
echo "   1) Build Backend only (+ Upload Config + Deploy)"
echo "   2) Build Frontend only (+ Upload Config + Deploy)"
echo "   3) Build Both"
echo "---------------------------------------------"

read -p "Your choice (1-3): " CHOICE

upload_configs

case $CHOICE in
    1) build_backend; trigger_deploy ;;
    2) build_frontend; trigger_deploy ;;
    3) build_backend; build_frontend; trigger_deploy ;;
    *) log_error "Invalid choice."; exit 1 ;;
esac
