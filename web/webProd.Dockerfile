# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: “builder” uses Node to install & compile your React app
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Copy package files so this layer can be cached when deps don’t change
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copy the rest of your source, then build the production bundle
COPY . .
ARG VITE_HCAPTCHA_SITEKEY
ENV VITE_HCAPTCHA_SITEKEY=$VITE_HCAPTCHA_SITEKEY
RUN npm run build
RUN npm cache clean --force
# Now /app/dist contains your compiled React app

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: “final” is a minimal Nginx image that serves /usr/share/nginx/html
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:latest AS final

# Optional: remove default content
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from the builder stage into Nginx’s docroot
COPY --from=builder /app/dist /usr/share/nginx/html

# add in the Nginx configuration file 
COPY nginx.conf /etc/nginx/conf.d/default.conf


# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
