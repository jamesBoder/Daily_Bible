# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Accept build arguments
ARG REACT_APP_API_URL=https://wordsofpraise-backend.fly.dev
ARG REACT_APP_GOOGLE_CLIENT_ID

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# Build the app (source maps and ESLint disabled to speed up Docker build)
RUN GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true npm run build

# Runtime stage
FROM nginx:alpine

# Copy nginx config — defaults to nginx.fly.conf for Fly.io production.
# Docker overrides this via docker-compose.yml build arg: NGINX_CONF=nginx.conf
ARG NGINX_CONF=nginx.fly.conf
COPY ${NGINX_CONF} /etc/nginx/nginx.conf

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]