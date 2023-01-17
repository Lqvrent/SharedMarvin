FROM nginx:stable-alpine

# Nginx configuration with SSL
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY ssl.conf /etc/nginx/ssl.conf
