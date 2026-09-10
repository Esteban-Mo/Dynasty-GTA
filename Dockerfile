# Dockerfile written by ServTower (Next.js recipe).
# It is yours: edit it freely, ServTower only reads it from here on.

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Prisma generates its client from the schema, so the schema comes with the manifests.
COPY prisma ./prisma
RUN npm ci && mkdir -p node_modules

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma picks its query engine from the OpenSSL it finds; without it, it guesses wrong.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx --yes prisma generate
RUN npm run build

FROM node:22-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
# Prisma picks its query engine from the OpenSSL it finds; without it, it guesses wrong.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
