FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Generate Drizzle migration
RUN pnpm generate

# Build the application
RUN pnpm build

EXPOSE 4002

CMD ["pnpm", "start"]
