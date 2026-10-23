# Contexto de build: raiz deste repositório.
# O build roda na arquitetura da máquina (sem dependências nativas); a imagem final vale para amd64 e arm64.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ src/
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/dist dist/
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
