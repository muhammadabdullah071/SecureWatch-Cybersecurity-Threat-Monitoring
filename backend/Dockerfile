FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]
