

### PHẦN 1: CHUẨN BỊ MÔI TRƯỜNG & KIỂM TRA

Bước này để đảm bảo ta không làm sập các web cũ đang chạy trên VPS.

1. **Kiểm tra ai đang chiếm cổng Web (Port 80):**
   Tại Terminal VS Code, chạy:
```bash
sudo netstat -tulpn | grep :80

```


* Nếu thấy `nginx`: VPS đang dùng Nginx.
* Nếu thấy `apache2` (hoặc `httpd`): VPS đang dùng Apache.
* *(Ghi nhớ kết quả này cho Phần 4)*.


2. **Kết nối Gitlab với VPS (Không cần mật khẩu):**
* Tạo key trên VPS:
```bash
ssh-keygen -t ed25519 -C "vps-mern-deploy"
# Nhấn Enter liên tục để không đặt mật khẩu

```


* Lấy key public:
```bash
cat ~/.ssh/id_ed25519.pub

```


* **Trên GitLab:** Vào Repo -> **Settings** -> **Repository** -> **Deploy keys** -> Dán key vào và Add.


3. **Tải Code về VPS:**
```bash
cd /home # Hoặc thư mục bạn muốn
git clone git@gitlab.com:username/ten-du-an.git
cd ten-du-an

```



---

### PHẦN 2: THIẾT LẬP DOCKER (CẤU HÌNH TRÁNH XUNG ĐỘT)

Chúng ta sẽ cho ứng dụng chạy ở cổng **8081** để nhường cổng 80 cho WordPress. Tạo/Sửa các file sau trong VS Code:

#### 1. Backend Dockerfile (`/backend/Dockerfile`)

```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]

```

#### 2. Frontend Dockerfile (`/frontend/Dockerfile`)

```dockerfile
# Stage 1: Build React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve bằng Nginx nội bộ
FROM nginx:alpine
# Kiểm tra folder build của bạn là 'dist' hay 'build' để sửa dòng dưới
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

```

#### 3. Config Nginx Nội bộ (`/frontend/nginx.conf`)

Giúp React Router không lỗi 404 và nối với Backend.

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```

#### 4. Docker Compose (`docker-compose.yml`) - QUAN TRỌNG

Map Frontend ra cổng **8081** và cấu hình Volume cho Database.

```yaml
version: '3.8'

services:
  # --- DATABASE ---
  mongo:
    image: mongo:6.0
    container_name: booking_mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}
    volumes:
      - mongo_data:/data/db # Lưu dữ liệu bền vững
    networks:
      - booking_net

  # --- BACKEND ---
  backend:
    build: ./backend
    container_name: booking_backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - MONGO_URI=mongodb://${MONGO_USER}:${MONGO_PASS}@mongo:27017/booking_db?authSource=Admin
      - PORT=8080
    depends_on:
      - mongo
    networks:
      - booking_net

  # --- FRONTEND ---
  frontend:
    build: ./frontend
    container_name: booking_frontend
    restart: always
    ports:
      - "8081:80"  # <--- Map cổng 8081 VPS vào 80 Container
    depends_on:
      - backend
    networks:
      - booking_net

networks:
  booking_net:
    driver: bridge

volumes:
  mongo_data:

```

**Tạo file `.env`:**

```text
MONGO_USER=admin
MONGO_PASS=MatKhauBaoMat123

```

---

### PHẦN 3: KẾT NỐI TÊN MIỀN (REVERSE PROXY)

Cấu hình để server chính (đang chạy WordPress) trỏ tên miền về cổng 8081.

* **TRƯỜNG HỢP A: Nếu VPS dùng NGINX**
1. Tạo file: `sudo nano /etc/nginx/sites-available/mern-booking`
2. Nội dung:
```nginx
server {
    listen 80;
    server_name ten-mien-du-an.com;
    location / {
        proxy_pass http://localhost:8081;
        # Các dòng header cần thiết
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```


3. Kích hoạt: `sudo ln -s /etc/nginx/sites-available/mern-booking /etc/nginx/sites-enabled/`
4. Reload: `sudo nginx -t && sudo systemctl reload nginx`


* **TRƯỜNG HỢP B: Nếu VPS dùng APACHE**
1. Tạo file: `sudo nano /etc/apache2/sites-available/mern-booking.conf`
2. Nội dung:
```apache
<VirtualHost *:80>
    ServerName ten-mien-du-an.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:8081/
    ProxyPassReverse / http://localhost:8081/
</VirtualHost>

```


3. Kích hoạt: `sudo a2ensite mern-booking.conf`
4. Reload: `sudo apache2ctl configtest && sudo systemctl reload apache2`



---

### PHẦN 4: TỰ ĐỘNG HÓA DEPLOY

Tạo file `deploy.sh` ở thư mục gốc dự án:

```bash
touch deploy.sh && chmod +x deploy.sh

```

Nội dung file:

```bash
#!/bin/bash
echo "🚀 BẮT ĐẦU DEPLOY..."
git fetch origin main
git reset --hard origin/main
# Build lại và chạy ngầm, xóa container thừa
docker compose up -d --build --remove-orphans
docker image prune -f
echo "✅ DEPLOY XONG! Web đang chạy tại port 8081."

```

---

### PHẦN 5: BẢO VỆ DỮ LIỆU (BACKUP & RESTORE)

Dù đã có Volume, bạn vẫn cần file backup đề phòng rủi ro.

#### 1. Tạo Script Backup (`backup_db.sh`)

```bash
touch backup_db.sh && chmod +x backup_db.sh

```

Nội dung:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups/mongodb"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup_$TIMESTAMP.gz"
mkdir -p $BACKUP_DIR

echo "📦 Đang backup Database..."
# Dump dữ liệu từ container ra file nén
docker exec booking_mongo /usr/bin/mongodump \
  --username Admin \
  --password MatKhauBaoMat123 \
  --authenticationDatabase Admin \
  --db booking_db \
  --archive --gzip > "$BACKUP_DIR/$FILENAME"

# Xóa backup cũ quá 7 ngày
find $BACKUP_DIR -type f -name "*.gz" -mtime +7 -delete
echo "✅ Xong: $FILENAME"

```

#### 2. Cài lịch tự động (Cronjob)

Chạy lệnh `crontab -e` và thêm dòng này vào cuối:

```bash
# Backup lúc 2h sáng mỗi ngày
0 2 * * * /path/to/project/backup_db.sh >> /root/backup.log 2>&1

```

#### 3. Cách Khôi phục (Restore) khi lỡ xóa data

Khi cần quay lại quá khứ, chạy lệnh này:

```bash
cat /root/backups/mongodb/ten_file_backup.gz | docker exec -i booking_mongo /usr/bin/mongorestore --username Admin --password MatKhauBaoMat123 --authenticationDatabase Admin --archive --gzip --drop

```

*(Lưu ý: `--drop` sẽ xóa data hiện tại để chép data backup vào).*

---

### TỔNG KẾT QUY TRÌNH HÀNG NGÀY

1. Code ở máy local -> Push lên GitLab.
2. Mở VS Code (Terminal Keeper).
3. Chạy: `./deploy.sh`
4. Hệ thống tự update code mới, WordPress vẫn sống khỏe, Data được backup mỗi đêm.


Chào bạn, đây là phần bổ sung rất thực tế. Đúng là trong quá trình vận hành, đôi khi vì lý do bảo mật định kỳ hoặc nghi ngờ lộ thông tin, bạn sẽ cần đổi mật khẩu Database.

Bạn hãy thêm phần này vào tài liệu Google Docs của mình nhé.

---

### PHẦN BỔ SUNG: CÁCH ĐỔI MẬT KHẨU MONGODB (SAU KHI ĐÃ DEPLOY)

Như đã giải thích, khi Database đã có dữ liệu, việc sửa file `.env` không còn tác dụng cập nhật mật khẩu cho Database nữa. Bạn phải thực hiện quy trình **3 bước** sau đây để đảm bảo đồng bộ:

#### Bước 1: Thay đổi mật khẩu trong lõi MongoDB

Chúng ta cần chui vào bên trong container đang chạy để ra lệnh đổi pass.

1. **Truy cập vào Mongo Shell bên trong Container:**
   Tại terminal VPS, chạy lệnh sau:
```bash
# Thay 'Admin' và 'MatKhauCu' bằng thông tin hiện tại của bạn
docker exec -it booking_mongo mongosh -u Admin -p MatKhauCu --authenticationDatabase Admin

```


*(Lưu ý: Các bản Mongo mới dùng lệnh `mongosh`, bản cũ dùng `mongo`)*.
2. **Chạy lệnh đổi mật khẩu:**
   Khi dấu nhắc lệnh chuyển sang dạng `test>`, bạn gõ lần lượt:
```javascript
// 1. Chuyển sang database quản trị
use admin

// 2. Lệnh đổi pass (Thay 'MatKhauMoi' bằng pass mới của bạn)
db.changeUserPassword("admin", "MatKhauMoi")

```


Nếu thấy thông báo `{ ok: 1 }` nghĩa là đổi thành công.
3. **Thoát ra:**
   Gõ `exit` để quay lại terminal VPS.

#### Bước 2: Cập nhật file cấu hình `.env`

Dù Database đã đổi pass, nhưng code Backend (file `.env`) vẫn đang lưu pass cũ. Nếu không sửa, Backend sẽ bị lỗi kết nối.

1. Mở file `.env`:
```bash
nano .env

```


2. Sửa dòng `MONGO_PASS` thành mật khẩu mới:
```text
MONGO_PASS=MatKhauMoi

```


3. Lưu lại (`Ctrl+O` -> `Enter` -> `Ctrl+X`).

#### Bước 3: Khởi động lại Backend

Để Backend nhận mật khẩu mới từ file `.env`.

```bash
# Chỉ cần restart backend, không cần restart database
docker compose restart backend

```

### Tóm tắt logic

Quy trình này giống như việc bạn đổi mật khẩu Facebook vậy:

1. Vào Facebook đổi pass (Bước 1 - Đổi trong DB).
2. Lưu pass mới vào trình quản lý mật khẩu/Ghi chú để lần sau đăng nhập (Bước 2 - Sửa file .env).
3. Đăng nhập lại (Bước 3 - Restart Backend).


Chào bạn, đây là hướng dẫn thực hành chi tiết **"Manual Deploy"** (Deploy thủ công) ngay trên VPS. Hướng dẫn này sẽ giải thích rõ luồng đi từ **Code -> Dockerfile -> Image -> Container** và cách cấu hình Nginx để public web ra ngoài.

Giả sử bạn đã SSH vào VPS và đang đứng tại thư mục dự án:

```bash
cd /home/betel-hospitability

```

---

### BƯỚC 1: THIẾT LẬP BIẾN MÔI TRƯỜNG (ENVIRONMENT)

Đây là bước quan trọng nhất. Docker không thể chạy nếu thiếu thông tin cấu hình (User DB, Mật khẩu, Link API...).

**1. Tạo file cấu hình cho Backend (`backend.env`)**
File này sẽ được nạp vào Container lúc chạy (Runtime).

* Chạy lệnh: `nano backend.env`
* Dán nội dung (Sửa lại thông tin thật):
```properties
NODE_ENV=production
PORT=8080

# DATABASE
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=MatKhauKhoNhatCoThe
# Lưu ý: 'mongo' là tên service trong docker-compose
MONGO_URI=mongodb://admin:MatKhauKhoNhatCoThe@mongo:27017/booking_db?authSource=admin

# APP SECRETS
JWT_SECRET=ChuoiBiMat123
JWT_EXPIRE=7d

# MAIL & CLOUD (Nếu có)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
SMPT_MAIL=email@gmail.com
SMPT_PASSWORD=app_password

```


* Lưu: `Ctrl+O` -> `Enter` -> `Ctrl+X`.

**2. Tạo file cấu hình cho Frontend (`frontend.env`)**
File này chứa thông tin để Vite build ra file tĩnh.

* Chạy lệnh: `nano frontend.env`
* Dán nội dung:
```properties
# Địa chỉ IP hoặc Domain mà trình duyệt người dùng sẽ gọi API
VITE_API_URL=http://ten-mien-cua-ban.com/api

```


* Lưu lại.

---

### BƯỚC 2: XỬ LÝ "BUILD-TIME" CHO FRONTEND (QUAN TRỌNG)

React/Vite đóng gói code thành HTML/JS tĩnh **trước khi** chạy. Do đó, bạn phải copy file biến môi trường vào trong code nguồn thì lệnh Build mới đọc được.

**Chạy lệnh sau:**

```bash
cp frontend.env frontend/.env

```

*(Giải thích: Copy file `frontend.env` ở ngoài vào thành file `.env` nằm trong thư mục `frontend/`. Khi Docker build, nó sẽ đọc file này).*

---

### BƯỚC 3: BUILD IMAGE VÀ KHỞI TẠO CONTAINER

Thay vì chạy từng lệnh `docker build` lẻ tẻ, chúng ta dùng **Docker Compose** để build và chạy cả 3 services (Mongo, Backend, Frontend) cùng lúc.

**Chạy lệnh duy nhất:**

```bash
docker compose up -d --build

```

**Giải thích chi tiết chuyện gì xảy ra sau lệnh này:**

1. **Từ Dockerfile -> Image:**
* Docker đọc `backend/Dockerfile` -> Tải Node.js -> Cài thư viện -> Tạo ra Image tên `betel_backend`.
* Docker đọc `frontend/Dockerfile` -> Tải Node.js -> Build React (lấy biến từ file .env vừa copy) -> Tải Nginx -> Tạo ra Image tên `betel_frontend`.
* Docker tải Image `mongo:6.0` từ kho online.


2. **Từ Image -> Container:**
* Nó tạo Container `betel_db_mongo` chạy cổng 27017.
* Nó tạo Container `betel_backend` chạy cổng 8080 (kết nối với Mongo).
* Nó tạo Container `betel_frontend` chạy cổng 8081 (kết nối với Backend).



**Kiểm tra kết quả:**

```bash
docker ps

```

*Bạn phải thấy 3 dòng container đang có trạng thái **Up ... seconds/minutes**.*

---

### BƯỚC 4: DỌN DẸP SAU KHI BUILD

Để bảo mật, sau khi Frontend đã build xong thành Image, file `.env` nằm trong code không còn tác dụng (và có thể gây lộ tin). Hãy xóa nó đi.

```bash
rm frontend/.env

```

Và xóa các Image rác (nếu có update nhiều lần):

```bash
docker image prune -f

```

---

### BƯỚC 5: CẤU HÌNH NGINX (REVERSE PROXY)

Lúc này, Website đang chạy ở `localhost:8081` bên trong VPS. Người ngoài chưa truy cập được. Bạn cần cấu hình Nginx chính của VPS (LarVPS) để mở cửa.

**1. Tạo file cấu hình Nginx**

```bash
nano /etc/nginx/conf.d/betel.conf

```

**2. Dán nội dung cấu hình:**

```nginx
server {
    listen 80;
    # Thay bằng tên miền bạn đã mua
    server_name ten-mien-cua-ban.com; 

    # Ghi log để sau này dễ sửa lỗi
    access_log /home/betel-hospitability/nginx_access.log;
    error_log /home/betel-hospitability/nginx_error.log;

    # Cấu hình chính: Chuyển mọi truy cập vào Container Frontend (Cổng 8081)
    location / {
        proxy_pass http://127.0.0.1:8081;
        
        # Các dòng này cực quan trọng để React Router và WebSocket chạy mượt
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

**3. Kiểm tra và Kích hoạt**

```bash
# Kiểm tra file config có lỗi cú pháp không
nginx -t 

# Nếu báo "syntax is ok", hãy reload Nginx để áp dụng
nginx -s reload

```

---

### BƯỚC 6: CÀI ĐẶT SSL (HTTPS) - KHUYÊN DÙNG

Web thời nay bắt buộc phải có ổ khóa xanh (HTTPS). Vì bạn dùng LarVPS (CentOS), cách dễ nhất là dùng **Certbot**.

1. **Cài Certbot (nếu chưa có):**
```bash
dnf install certbot python3-certbot-nginx -y

```


2. **Lấy chứng chỉ SSL tự động:**
```bash
certbot --nginx -d ten-mien-cua-ban.com

```


* Nhập email của bạn.
* Chọn `Y` (Đồng ý điều khoản).
* Nếu nó hỏi có Redirect HTTP sang HTTPS không -> Chọn `2` (Redirect - Khuyên dùng).



---

### TỔNG KẾT: SƠ ĐỒ HOẠT ĐỘNG

Sau khi bạn làm xong 6 bước trên, luồng chạy sẽ như sau:

1. Khách truy cập `https://ten-mien-cua-ban.com`.
2. **Nginx (VPS)** nhận yêu cầu -> Chuyển tiếp vào cổng nội bộ `8081`.
3. **Container Frontend** (đang lắng nghe 8081) trả về giao diện React.
4. Giao diện React (trên máy khách) gọi API tới `https://ten-mien-cua-ban.com/api`.
5. **Nginx (VPS)** nhận yêu cầu `/api` -> Chuyển tiếp vào cổng nội bộ `8081`.
6. **Nginx (Trong Container Frontend)** nhận yêu cầu `/api` -> Proxy ngược vào **Backend** (theo config `nginx.conf` nội bộ bạn đã làm ở các bước trước).
7. **Container Backend** xử lý, gọi **Container Mongo** lấy dữ liệu và trả về.

Chào bạn, đây là hướng dẫn thực hành chi tiết **"Manual Deploy"** (Deploy thủ công) ngay trên VPS. Hướng dẫn này sẽ giải thích rõ luồng đi từ **Code -> Dockerfile -> Image -> Container** và cách cấu hình Nginx để public web ra ngoài.

Giả sử bạn đã SSH vào VPS và đang đứng tại thư mục dự án:

```bash
cd /home/betel-hospitability

```

---

### BƯỚC 1: THIẾT LẬP BIẾN MÔI TRƯỜNG (ENVIRONMENT)

Đây là bước quan trọng nhất. Docker không thể chạy nếu thiếu thông tin cấu hình (User DB, Mật khẩu, Link API...).

**1. Tạo file cấu hình cho Backend (`backend.env`)**
File này sẽ được nạp vào Container lúc chạy (Runtime).

* Chạy lệnh: `nano backend.env`
* Dán nội dung (Sửa lại thông tin thật):
```properties
NODE_ENV=production
PORT=8080

# DATABASE
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=MatKhauKhoNhatCoThe
# Lưu ý: 'mongo' là tên service trong docker-compose
MONGO_URI=mongodb://admin:MatKhauKhoNhatCoThe@mongo:27017/booking_db?authSource=admin

# APP SECRETS
JWT_SECRET=ChuoiBiMat123
JWT_EXPIRE=7d

# MAIL & CLOUD (Nếu có)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
SMPT_MAIL=email@gmail.com
SMPT_PASSWORD=app_password

```


* Lưu: `Ctrl+O` -> `Enter` -> `Ctrl+X`.

**2. Tạo file cấu hình cho Frontend (`frontend.env`)**
File này chứa thông tin để Vite build ra file tĩnh.

* Chạy lệnh: `nano frontend.env`
* Dán nội dung:
```properties
# Địa chỉ IP hoặc Domain mà trình duyệt người dùng sẽ gọi API
VITE_API_URL=http://ten-mien-cua-ban.com/api

```


* Lưu lại.

---

### BƯỚC 2: XỬ LÝ "BUILD-TIME" CHO FRONTEND (QUAN TRỌNG)

React/Vite đóng gói code thành HTML/JS tĩnh **trước khi** chạy. Do đó, bạn phải copy file biến môi trường vào trong code nguồn thì lệnh Build mới đọc được.

**Chạy lệnh sau:**

```bash
cp frontend.env frontend/.env

```

*(Giải thích: Copy file `frontend.env` ở ngoài vào thành file `.env` nằm trong thư mục `frontend/`. Khi Docker build, nó sẽ đọc file này).*

---

### BƯỚC 3: BUILD IMAGE VÀ KHỞI TẠO CONTAINER

Thay vì chạy từng lệnh `docker build` lẻ tẻ, chúng ta dùng **Docker Compose** để build và chạy cả 3 services (Mongo, Backend, Frontend) cùng lúc.

**Chạy lệnh duy nhất:**

```bash
docker compose up -d --build

```

**Giải thích chi tiết chuyện gì xảy ra sau lệnh này:**

1. **Từ Dockerfile -> Image:**
* Docker đọc `backend/Dockerfile` -> Tải Node.js -> Cài thư viện -> Tạo ra Image tên `betel_backend`.
* Docker đọc `frontend/Dockerfile` -> Tải Node.js -> Build React (lấy biến từ file .env vừa copy) -> Tải Nginx -> Tạo ra Image tên `betel_frontend`.
* Docker tải Image `mongo:6.0` từ kho online.


2. **Từ Image -> Container:**
* Nó tạo Container `betel_db_mongo` chạy cổng 27017.
* Nó tạo Container `betel_backend` chạy cổng 8080 (kết nối với Mongo).
* Nó tạo Container `betel_frontend` chạy cổng 8081 (kết nối với Backend).



**Kiểm tra kết quả:**

```bash
docker ps

```

*Bạn phải thấy 3 dòng container đang có trạng thái **Up ... seconds/minutes**.*

---

### BƯỚC 4: DỌN DẸP SAU KHI BUILD

Để bảo mật, sau khi Frontend đã build xong thành Image, file `.env` nằm trong code không còn tác dụng (và có thể gây lộ tin). Hãy xóa nó đi.

```bash
rm frontend/.env

```

Và xóa các Image rác (nếu có update nhiều lần):

```bash
docker image prune -f

```

---

### BƯỚC 5: CẤU HÌNH NGINX (REVERSE PROXY)

Lúc này, Website đang chạy ở `localhost:8081` bên trong VPS. Người ngoài chưa truy cập được. Bạn cần cấu hình Nginx chính của VPS (LarVPS) để mở cửa.

**1. Tạo file cấu hình Nginx**

```bash
nano /etc/nginx/conf.d/betel.conf

```

**2. Dán nội dung cấu hình:**

```nginx
server {
    listen 80;
    # Thay bằng tên miền bạn đã mua
    server_name ten-mien-cua-ban.com; 

    # Ghi log để sau này dễ sửa lỗi
    access_log /home/betel-hospitability/nginx_access.log;
    error_log /home/betel-hospitability/nginx_error.log;

    # Cấu hình chính: Chuyển mọi truy cập vào Container Frontend (Cổng 8081)
    location / {
        proxy_pass http://127.0.0.1:8081;
        
        # Các dòng này cực quan trọng để React Router và WebSocket chạy mượt
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

**3. Kiểm tra và Kích hoạt**

```bash
# Kiểm tra file config có lỗi cú pháp không
nginx -t 

# Nếu báo "syntax is ok", hãy reload Nginx để áp dụng
nginx -s reload

```

---

### BƯỚC 6: CÀI ĐẶT SSL (HTTPS) - KHUYÊN DÙNG

Web thời nay bắt buộc phải có ổ khóa xanh (HTTPS). Vì bạn dùng LarVPS (CentOS), cách dễ nhất là dùng **Certbot**.

1. **Cài Certbot (nếu chưa có):**
```bash
dnf install certbot python3-certbot-nginx -y

```


2. **Lấy chứng chỉ SSL tự động:**
```bash
certbot --nginx -d ten-mien-cua-ban.com

```


* Nhập email của bạn.
* Chọn `Y` (Đồng ý điều khoản).
* Nếu nó hỏi có Redirect HTTP sang HTTPS không -> Chọn `2` (Redirect - Khuyên dùng).



---

### TỔNG KẾT: SƠ ĐỒ HOẠT ĐỘNG

Sau khi bạn làm xong 6 bước trên, luồng chạy sẽ như sau:

1. Khách truy cập `https://ten-mien-cua-ban.com`.
2. **Nginx (VPS)** nhận yêu cầu -> Chuyển tiếp vào cổng nội bộ `8081`.
3. **Container Frontend** (đang lắng nghe 8081) trả về giao diện React.
4. Giao diện React (trên máy khách) gọi API tới `https://ten-mien-cua-ban.com/api`.
5. **Nginx (VPS)** nhận yêu cầu `/api` -> Chuyển tiếp vào cổng nội bộ `8081`.
6. **Nginx (Trong Container Frontend)** nhận yêu cầu `/api` -> Proxy ngược vào **Backend** (theo config `nginx.conf` nội bộ bạn đã làm ở các bước trước).
7. **Container Backend** xử lý, gọi **Container Mongo** lấy dữ liệu và trả về.