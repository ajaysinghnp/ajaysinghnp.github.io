
# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

WORKDIR /app

# --------------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# --------------------------------------------------
# Stage 2: Production build
# --------------------------------------------------
FROM deps AS build

ENV NODE_ENV=production

COPY . .

RUN --mount=type=cache,id=next-build-cache,target=/app/build/cache \
    --mount=type=secret,id=github_token,env=GITHUB_TOKEN,required=true \
    pnpm run build

# --------------------------------------------------
# Stage 3: Production runtime
# --------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Copy only production assets and standalone output.
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/build/standalone ./
COPY --from=build --chown=node:node /app/build/static ./build/static

# Allow the non-root runtime user to write to the Next.js
# build directory if runtime caching or revalidation needs it.
RUN mkdir -p /app/build/cache \
    && chown -R node:node /app/build

USER node

EXPOSE 3000

CMD ["node", "server.js"]
