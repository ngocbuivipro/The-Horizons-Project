FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- XÓA DÒNG NÀY ---
# COPY .env ./.env  <-- XÓA BỎ. Image phải sạch.

EXPOSE 8080
CMD ["node", "index.js"]
