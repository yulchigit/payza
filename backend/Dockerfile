FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY sql ./sql
COPY scripts ./scripts

EXPOSE 5000

CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then node scripts/run-migrations.js; fi && node src/server.js"]
