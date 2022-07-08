# Diplomata Belgica

## Requirements

- Apache2
- PHP 7.4 FPM
- Elasticsearch 7
- MariaDB 10.4
- Composer2


- Development tools
    - node 14
    - npm 6
    - yarn

## Install development version

### Vagrant setup

    [TODO] git clone git@github.ugent.be:GhentCDH/dibe-vagrant.git dibe_vagrant
    cd dibe_vagrant

Start virtual machine

    vagrant up

SSH to vm

    vagrant ssh

### Install server packages

    sudo ./install/elasticsearch7.sh
    sudo ./install/mariadb-10.4.sh
    sudo ./install/apache.sh
    sudo ./install/php7.4-fpm.sh

    # install build tools
    sudo ./install/composer.sh
    sudo ./install/nodejs.sh
    sudo npm i yarn -g

    # install symfony cli
    sudo ./install/symfony-cli.sh

#### set default php version to 7.4

    sudo update-alternatives --set php /usr/bin/php7.4    

### Deploy code

    [TODO] git clone git@github.ugent.be:GhentCDH/Dibe-web.git dibe
    cd dibe
    # install php dependencies
    composer install
    # install node dependencies
    composer dump-env dev
    # dump .env.* to .env.local.php
    yarn install

### Import database

Download database from [data.ghentcdh.ugent.be](https://data.ghentcdh.ugent.be) and import using

    sudo mysql < db_dibe.sql

Create user and set permissions

    sudo mysql < ./dev/create-user.sql

### Create/Update Elasticsearch index

    php bin/console app:elasticsearch:index charters

### Test site

Site is available on these addresses:

    http://dibe.local/dibe/public
    http://localhost:8080/dibe/public/

## Misc

### Pull qas build

    git pull
    php7.4 bin/console cache:clear --env=qas

### Pull prod build

    git pull
    php7.4 bin/console cache:clear --env=prod


































































