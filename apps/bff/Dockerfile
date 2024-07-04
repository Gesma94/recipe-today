# Stage 1: Build the react app
FROM node:20-alpine as base

# Copy the whole monorepo
COPY . ./usr/src/app

# Move to bff folder
WORKDIR /usr/src/app/apps/bff

# Overwrite the .env file with .env.docker
RUN cp .env.docker .env

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Set the PORT environment variable
ENV PORT 4000

# Expose port 4000
EXPOSE 4000

# Start the dev server
CMD ["pnpm", "start"]