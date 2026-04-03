Chào bạn, xin lỗi vì thiếu sót đó. Đối với người mới làm quen với dòng lệnh Linux (SSH), việc di chuyển giữa các thư mục và mở trình soạn thảo là phần dễ gây nhầm lẫn nhất.

Dưới đây là **HƯỚNG DẪN CẦM TAY CHỈ VIỆC (COMMAND-LINE VERSION)**. Mình đã thêm đầy đủ các lệnh `cd` (di chuyển), `nano` (mở file), và hướng dẫn cách Lưu/Thoát chi tiết.

Giả sử thư mục dự án của bạn trên VPS là: `/home/betel-hospitability` (Nếu khác, bạn tự thay thế nhé).

---

### BƯỚC 1: TRUY CẬP THƯ MỤC DỰ ÁN & TẠO BIẾN MÔI TRƯỜNG

Đầu tiên, hãy chắc chắn bạn đang đứng đúng chỗ.

**1. Di chuyển vào thư mục dự án:**

```bash
cd /home/betel-hospitability

```

**2. Tạo file `backend.env`:**
Chạy lệnh mở trình soạn thảo:

```bash
nano backend.env

```

*(Màn hình sẽ chuyển sang giao diện soạn thảo đen ngòm)*. Bạn copy và dán nội dung sau vào:

```properties
NODE_ENV=production
PORT=8080

# DATABASE
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=MatKhauKhoNhatCoThe
MONGO_URI=mongodb://admin:MatKhauKhoNhatCoThe@mongo:27017/booking_db?authSource=admin

# CORS (Cho phép frontend gọi vào)
ALLOWED_ORIGINS=https://betelhospitality.com,https://www.betelhospitality.com

# APP SECRETS
JWT_SECRET=ChuoiBiMat123
JWT_EXPIRE=7d

# CLOUDINARY (Thông tin bạn vừa lấy)
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=ma_bi_mat_cua_ban

```

🔴 **CÁCH LƯU VÀ THOÁT NANO (Làm y hệt nhé):**

1. Nhấn tổ hợp phím **Ctrl + O** (chữ O, không phải số 0) -> Nhấn **Enter** (để lưu).
2. Nhấn tổ hợp phím **Ctrl + X** (để thoát ra ngoài).

**3. Tạo file `frontend.env`:**
Chạy lệnh:

```bash
nano frontend.env

```

Dán nội dung:

```properties
VITE_API_URL=https://api.betelhospitality.com

```

*(Lưu và thoát: `Ctrl+O` -> `Enter` -> `Ctrl+X`)*.

---

### BƯỚC 2: SỬA CẤU HÌNH NGINX NỘI BỘ (CỦA DOCKER)

File này nằm sâu trong thư mục `frontend` của code.

**1. Mở file `nginx.conf` trong thư mục frontend:**

```bash
nano frontend/nginx.conf

```

**2. Xóa hết nội dung cũ và dán nội dung mới này vào:**
*(Nội dung này đơn giản hóa, không cần proxy /api nữa vì ta dùng subdomain rồi)*

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}

```

*(Lưu và thoát: `Ctrl+O` -> `Enter` -> `Ctrl+X`)*.

---

### BƯỚC 3: BUILD VÀ CHẠY DOCKER

Vẫn đứng tại thư mục `/home/betel-hospitability`, bạn chạy lần lượt các lệnh sau:

```bash
# 1. Copy file env vào trong folder frontend để chuẩn bị build
cp frontend.env frontend/.env

# 2. Dựng và chạy container (Quá trình này sẽ mất vài phút)
docker compose up -d --build

# 3. Sau khi chạy xong, xóa file env tạm trong frontend đi cho an toàn
rm frontend/.env

# 4. Dọn dẹp các image rác cũ cho nhẹ máy
docker image prune -f

```

---

### BƯỚC 4: CẤU HÌNH NGINX CỦA VPS (REVERSE PROXY)

Đây là file cấu hình của "Lễ tân" VPS, nằm ở thư mục hệ thống `/etc/nginx/...`.

**1. Tạo/Mở file cấu hình:**

```bash
nano /etc/nginx/conf.d/betel.conf

```

**2. Dán toàn bộ nội dung sau (Chia 2 khối server):**

```nginx
# --- KHỐI 1: FRONTEND (betelhospitality.com) ---
server {
    listen 80;
    server_name betelhospitality.com www.betelhospitality.com;

    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log;

    location / {
        # Đẩy vào Container Frontend (đang chạy port 8081)
        proxy_pass http://127.0.0.1:8081;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# --- KHỐI 2: BACKEND (api.betelhospitality.com) ---
server {
    listen 80;
    server_name api.betelhospitality.com;

    access_log /var/log/nginx/backend_access.log;
    error_log /var/log/nginx/backend_error.log;

    location / {
        # Đẩy vào Container Backend (đang chạy port 8080)
        proxy_pass http://127.0.0.1:8080;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

```

*(Lưu và thoát: `Ctrl+O` -> `Enter` -> `Ctrl+X`)*.

**3. Kiểm tra và khởi động lại Nginx:**

```bash
# Kiểm tra xem có viết sai cú pháp không
nginx -t

# Nếu báo "syntax is ok" thì chạy lệnh reload
nginx -s reload

```

---

### BƯỚC 5: CÀI SSL (HTTPS)

Chạy lệnh này và làm theo hướng dẫn trên màn hình (nhập email, chọn Y...):

```bash
certbot --nginx -d betelhospitality.com -d www.betelhospitality.com -d api.betelhospitality.com

```

Làm xong bước này là web của bạn đã online hoàn chỉnh với 2 tên miền riêng biệt!