FROM node:20-alpine

# OpenSSL needed by Prisma engine
RUN apk add --no-cache openssl

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client + build Next.js
RUN npx prisma generate
RUN npm run build

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

# Start script: migrate + seed (if empty) + start server
CMD sh -c "\
  DATABASE_URL=file:/app/data/nutridrip.db npx prisma migrate deploy && \
  DATABASE_URL=file:/app/data/nutridrip.db npx tsx prisma/seed.ts 2>/dev/null; \
  DATABASE_URL=file:/app/data/nutridrip.db npm start"
