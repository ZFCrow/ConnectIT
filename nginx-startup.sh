#!/bin/bash

CERT_PATH="/etc/nginx/ssl/live/connectitweb.site/fullchain.pem"
CONFIG_FILE="/etc/nginx/conf.d/default.conf"

if [ -f "$CERT_PATH" ]; then
    echo "SSL certificates found, generating HTTPS config..."
    cat > $CONFIG_FILE << 'EOF'
server {
    listen 80;
    server_name connectitweb.site www.connectitweb.site;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri $uri/ =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl default_server;
    server_name _;
    
    ssl_certificate /etc/nginx/ssl/live/connectitweb.site/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/connectitweb.site/privkey.pem;
    
    return 301 https://connectitweb.site$request_uri;
}
server {
    listen 443 ssl;
    http2 on;
    server_name connectitweb.site www.connectitweb.site;

    ssl_certificate /etc/nginx/ssl/live/connectitweb.site/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/connectitweb.site/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://web:3300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


EOF
else
    echo "No SSL certificates found, generating HTTP-only config..."
    cat > $CONFIG_FILE << 'EOF'
server {
    listen 80;
    server_name connectitweb.site www.connectitweb.site;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri $uri/ =404;
    }
    
    location / {
        proxy_pass http://web:3300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
fi

echo "Starting nginx with generated config..."
exec nginx -g "daemon off;"