FROM registry.access.redhat.com/ubi9/nodejs-20 AS builder

WORKDIR /usr/src/app

COPY ./package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal AS deployment

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

USER root
RUN microdnf makecache && \
    curl -lLfO https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm && \
    curl -lLfO http://download.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-9 && \
    rpm --import RPM-GPG-KEY-EPEL-9 && \
    rpm -i ./epel-release-latest-9.noarch.rpm && \
    rm -rdf RPM-GPG-KEY-EPEL-9 epel-release-latest-9.noarch.rpm && \
    /usr/bin/crb enable && \
    microdnf update -y && \
    microdnf install nginx supervisor -y && \
    microdnf clean all

RUN mkdir -p /run/nginx/log /run/nginx/cache && \
    chown 1001:1001 -R /run/nginx && \
    chown 1001:1001 -R /var/log/nginx
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/supervisord.conf /etc/supervisord.conf

USER 1001
WORKDIR /opt/app

COPY --chown=1001:1001 --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=1001:1001 --from=builder /usr/src/app/dist ./dist

CMD ["supervisord", "-c", "/etc/supervisord.conf"]