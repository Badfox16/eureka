# Imagem base oficial do Bun
FROM oven/bun:1.1

WORKDIR /app

COPY package.json nodemon.json bun.lock* tsconfig.json ./
RUN bun install

COPY server/. .
COPY .env .env

# RUN mkdir -p tmp/uploads
RUN bun run build

EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]