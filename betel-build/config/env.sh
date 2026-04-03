#!/bin/bash

# --- 1. THÔNG TIN VPS (SỬA Ở ĐÂY) ---
REMOTE_USER="root"                # User SSH (thường là root hoặc ubuntu)
REMOTE_HOST="116.118.48.142"        # IP của VPS
REMOTE_PROJECT_DIR="/home/betel-hospitability"

# --- 2. MÀU SẮC LOG (Để in ra terminal cho đẹp) ---
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- 3. CÁC HÀM TIỆN ÍCH ---
log_info() { echo -e "${CYAN}[INFO] $1${NC}"; }
log_success() { echo -e "${GREEN}[SUCCESS] $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARNING] $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $1${NC}"; }
