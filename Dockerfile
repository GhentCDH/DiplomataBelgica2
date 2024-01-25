ARG PHP_VERSION=8.1
ARG NODE_VERSION=18
ARG NODE_PLATFORM=bookworm-slim
# based on:
# - https://adambrodziak.pl/dockerfile-good-practices-for-node-and-npm
# - https://pnpm.io/docker

# ----------------------------------------------------------
# ASSET_BUILDER
# ----------------------------------------------------------
FROM node:${NODE_VERSION}-${NODE_PLATFORM} as asset_builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /dist
COPY --link package.json pnpm-lock.yaml webpack.config.js ./
COPY --link config ./config
COPY --link assets ./assets
RUN --mount=type=cache,id=pnpm,target=/pnpm/store set -eux; \
    pnpm install --frozen-lockfile; \
    pnpm encore production;

# ----------------------------------------------------------
# UPSTREAM
# ----------------------------------------------------------
FROM shinsenter/phpfpm-apache:php${PHP_VERSION} AS upstream
ARG PHP_VERSION=8.1

ENV APP_ROOT="/app"
ENV WEBHOME="${APP_ROOT}/public"
ENV PHP_OPEN_BASEDIR="$APP_ROOT"

# ----------------------------------------------------------
# BASE
# ----------------------------------------------------------
FROM upstream AS base

# Configure apache
RUN a2dismod -f autoindex

# Configure PHP
RUN phpdismod pdo_sqlite tidy gmp soap redis xdebug gd \
    && phpaddmod intl iconv && phpenmod intl iconv pdo pdo_mysql mysqli mysqlnd

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1

# ----------------------------------------------------------
# DEV
# ----------------------------------------------------------
FROM base AS dev
ENV APP_ENV=dev

# Install packages
RUN set -eux; \
    apt-get update -qq; \
    apt-get install -qq -y curl git apt-transport-https gnupg software-properties-common;

# Configure PHP
RUN phpaddmod xdebug

# Install NodeJs 18
RUN set -eux; \
    curl -sL https://deb.nodesource.com/setup_18.x | sudo bash - ; \
    sudo apt-get install -y nodejs;

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install Symfony Cli
RUN set -eux; \
    curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | sudo -E bash; \
    sudo apt-get install -y symfony-cli

WORKDIR $APP_ROOT

# ----------------------------------------------------------
# PROD
# ----------------------------------------------------------
FROM base AS prod
ENV APP_ENV=prod

WORKDIR $APP_ROOT

# Install dependencies first, as they change less often than code.
COPY --link composer.* symfony.* ./
RUN set -eux; \
	composer install --no-cache --prefer-dist --no-dev --no-autoloader --no-scripts --no-progress;

# Copy sources
COPY --link config ./config
COPY --link bin ./bin
COPY --link migrations ./migrations
COPY --link public ./public
COPY --link src ./src
COPY --link translations ./translations

# Copy static
COPY --from=asset_builder /dist/public/build ./public/

# Finish install
RUN set -eux; \
	touch .env; \
    mkdir -p var/cache var/log; \
    chown -R www-data:www-data var; \
	composer dump-autoload --classmap-authoritative --no-dev; \
	composer dump-env prod; \
#	composer run-script --no-dev post-install-cmd; \
	chmod +x bin/console; sync;