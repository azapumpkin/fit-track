FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm --prefix backend ci
RUN npm --prefix frontend ci

COPY backend ./backend
COPY frontend ./frontend

RUN ./backend/node_modules/.bin/prisma generate --schema ./backend/prisma/schema.prisma
RUN npm --prefix backend run build
RUN npm --prefix frontend run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 10000

CMD ["node", "backend/dist/server.js"]
