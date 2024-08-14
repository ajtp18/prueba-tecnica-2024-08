FROM registry.access.redhat.com/ubi9/nodejs-20 AS builder

WORKDIR /usr/src/app

COPY ./package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal AS deployment

ENV PORT=3000
ENV NODE_ENV=production

ENV DB_HOST=db
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV DB_NAME=postgres

ENV WOMPI_BASE_URL=redacted
ENV WOMPI_PUBLIC_KEY=redacted
ENV WOMPI_PRIVATE_KEY=redacted
ENV WOMPI_SIGNATURE_KEY=redacted

USER 1001
WORKDIR /opt/app

COPY --chown=1001:1001 --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=1001:1001 --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]