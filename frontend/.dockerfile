# Stage 1: Build React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the build using nginx
FROM nginx:alpine

# Copy build files from stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
