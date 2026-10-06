# Contexto de build: raiz deste repositório.
# VITE_BFF_URL é o endereço do BFF visto pelo navegador: o BFF local no desenvolvimento,
# o API Gateway na nuvem.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/shell/package.json packages/shell/
COPY packages/mfe-auth/package.json packages/mfe-auth/
COPY packages/mfe-cryptos/package.json packages/mfe-cryptos/
COPY packages/mfe-dashboard/package.json packages/mfe-dashboard/
RUN npm ci
COPY tsconfig.base.json ./
COPY packages/ packages/

ARG VITE_BFF_URL=http://localhost:5100
ENV VITE_BFF_URL=$VITE_BFF_URL

# Cada microfrontend é compilado para o seu caminho; o shell recebe o endereço de cada remoteEntry.js.
RUN PUBLIC_BASE=/mfe-auth/ npm run build -w @puccrypto/mfe-auth \
 && PUBLIC_BASE=/mfe-cryptos/ npm run build -w @puccrypto/mfe-cryptos \
 && PUBLIC_BASE=/mfe-dashboard/ npm run build -w @puccrypto/mfe-dashboard \
 && MFE_AUTH_URL=/mfe-auth/remoteEntry.js \
    MFE_CRYPTOS_URL=/mfe-cryptos/remoteEntry.js \
    MFE_DASHBOARD_URL=/mfe-dashboard/remoteEntry.js \
    npm run build -w @puccrypto/shell

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/shell/dist /usr/share/nginx/html
COPY --from=build /app/packages/mfe-auth/dist /usr/share/nginx/html/mfe-auth
COPY --from=build /app/packages/mfe-cryptos/dist /usr/share/nginx/html/mfe-cryptos
COPY --from=build /app/packages/mfe-dashboard/dist /usr/share/nginx/html/mfe-dashboard
EXPOSE 80
