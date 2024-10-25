# Sử dụng node.js image
FROM node:18

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và cài đặt các dependencies
COPY package*.json ./

RUN npm install

# Copy toàn bộ source code vào thư mục làm việc
COPY . .

# Expose port cho frontend
EXPOSE 8686

# Chạy Vite server
CMD ["npm", "run", "dev"]
