ARG NODE_VERSION=20
ARG PHP_VERSION=8.1
# ----------------------------------------------------------
# NODE
# ----------------------------------------------------------

# NODE-BASE
FROM node:${NODE_VERSION}-slim AS node-base

RUN apt-get update -qq && \
    apt-get install -qq -y \
        openssh-client \
        curl \
        apt-transport-https \
        gnupg \
        openssh-client \
        software-properties-common \
        git && \
    apt-get clean && \
    apt-get autoclean

# Add GitHub.com to known hosts for SSH
RUN mkdir -p -m 0600 ~/.ssh && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts

RUN corepack enable

# NODE-PROD
FROM node-base AS node-prod

WORKDIR "/app"
COPY ./app /app

# add ssh key (add context .ssh default in docker compose)
RUN --mount=type=ssh pnpm install && \
    pnpm encore production

# NODE-DEV
FROM node-base AS node-dev

WORKDIR "/app"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

CMD pnpm install; pnpm encore dev --watch

# ----------------------------------------------------------
# PHP/SYMFONY
# ----------------------------------------------------------

FROM webdevops/php-dev:${PHP_VERSION} AS symfony-base

WORKDIR "/app"

RUN set -eux && \
    apt-get update -qq && \
    apt-get install -qq -y \
        curl \
        apt-transport-https \
        gnupg \
        openssh-client \
        software-properties-common \
        git && \
    curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash - && \
    apt-get install symfony-cli && \
    apt-get clean && \
    apt-get autoclean

ENV COMPOSER_ALLOW_SUPERUSER=1

# ----------------------------------------------------------
# DEVELOPMENT
# ----------------------------------------------------------

FROM symfony-base AS dev
USER root
WORKDIR "/app"

ENV APP_ENV=dev
ENV PHP_MEMORY_LIMIT=1024M

CMD /app/scripts/docker-startup-script.sh

# ----------------------------------------------------------
# BASE-PRODUCTION
# ----------------------------------------------------------

FROM symfony-base AS symfony-prod
WORKDIR "/app"

# Add GitHub.com to known hosts for SSH
RUN mkdir -p -m 0600 ~/.ssh && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts

# copy sources
RUN mkdir -p var/cache var/log public

COPY config ./config
COPY bin ./bin
COPY migrations ./migrations
COPY public ./public
COPY src ./src
COPY translations ./translations
COPY public/index.php ./public
COPY public/.htaccess ./public

# install composer dependencies
RUN --mount=type=ssh \
    set -eux; \
    composer install --no-scripts --no-dev --no-progress;

# ----------------------------------------------------------
# PRODUCTION
# ----------------------------------------------------------

FROM webdevops/php-apache:${PHP_VERSION} AS prod
# USER application

COPY --link --from=symfony-prod --chown=1000:1000 /app /app
COPY --link --from=node-prod --chown=1000:1000 /app/public/build /app/public/build

ENV APP_ENV=prod
ENV PHP_MEMORY_LIMIT=1024M

ENV WEB_DOCUMENT_ROOT="/app/public"
ENV WEB_DOCUMENT_INDEX="/app/public/index.php"

