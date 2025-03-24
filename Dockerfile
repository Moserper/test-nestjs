# Stage 1: Build the application
FROM node:20-slim AS base
RUN apt-get update
RUN apt-get install -y openssl

FROM base AS builder
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn prisma migrate deploy

# Stage 2: Run the application
FROM base as runner
WORKDIR /app

RUN chown -R node:node /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/yarn.lock ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
USER node

EXPOSE 3000
CMD ["yarn", "start:prod"]
