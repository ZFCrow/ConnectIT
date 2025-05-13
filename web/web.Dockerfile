# web/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Expose Vite’s dev server port
EXPOSE 5173


CMD ["npm", "run", "dev"]
