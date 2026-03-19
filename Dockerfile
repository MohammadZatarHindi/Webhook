# Use Node 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Build TypeScript
RUN npm run build

# Default CMD (can be overridden in docker-compose)
CMD ["npm", "run", "worker"]