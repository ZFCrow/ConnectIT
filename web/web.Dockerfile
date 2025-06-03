# web/Dockerfile
FROM node:18-alpine

# Set the working directory 
WORKDIR /app

# copy just the JSON files and install deps 
COPY package.json package-lock.json ./
RUN npm ci


# Expose Vite’s dev server port
EXPOSE 5173


