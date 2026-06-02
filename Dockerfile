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

EXPOSE 3000

# Start script: migrate + seed + start server
# Railway provides DATABASE_URL automatically
CMD sh -c "\
  echo 'DATABASE_URL: $${DATABASE_URL}' && \
  npx prisma migrate deploy && \
  npx tsx prisma/seed.ts || true && \
  npm start"
