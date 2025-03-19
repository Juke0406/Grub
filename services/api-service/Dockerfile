FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the service port
EXPOSE 3007

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["node", "dist/index.js"]