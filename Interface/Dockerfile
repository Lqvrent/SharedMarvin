FROM node:lts-alpine as build

# Install dependencies and build
WORKDIR /usr/src/app
COPY package*.json package-lock*.json ./
RUN npm install
COPY . .
RUN npm run build

# Copy build to nginx
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist/interface /usr/share/nginx/html

# Nginx configuration with SSL
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY nginx/ssl.conf /etc/nginx/ssl.conf
