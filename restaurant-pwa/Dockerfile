FROM node:20-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build app for production with PWA support
RUN npm run build

# Production stage with nginx
FROM nginx:stable-alpine as production-stage

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy PWA assets
COPY --from=build-stage /app/public /usr/share/nginx/html/public

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

