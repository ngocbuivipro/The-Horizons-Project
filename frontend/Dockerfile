FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# --- ĐOẠN MỚI CẦN SỬA ---
# 1. Khai báo tham số ARG (chờ nhận từ bên ngoài)
ARG VITE_BASE_URI

# 2. Ghi nó vào file .env để Vite tự động đọc khi build
RUN echo "VITE_BASE_URI=$VITE_BASE_URI" > .env
# ------------------------

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
