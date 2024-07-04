# Stage 1: Build the react app
FROM node:20-alpine as base

# Copy the whole monorepo
COPY . ./usr/src/app

# Move to bff folder
WORKDIR /usr/src/app/apps/webapp

# Overwrite the .env file with .env.docker
RUN cp .env.docker .env

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Build the application
RUN pnpm run build

# Stage 2: Serve the react app with nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=base /usr/src/app/apps/webapp/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
