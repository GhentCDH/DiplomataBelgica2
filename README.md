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

    git clone git@github.ugent.be:GhentCDH/dibe-vagrant.git dibe_vagrant
    cd dibe_vagrant

Start virtual machine

    vagrant up

SSH to vm

    vagrant ssh

### Install server packages

    sudo ./install/elasticsearch7.sh
    sudo ./install/mariadb-10.4.sh
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

    git clone git@github.com:GhentCDH/DiplomataBelgica2.git dibe
    cd dibe
    # install php dependencies
    composer install
    # dump .env.* to .env.local.php
    composer dump-env dev
    # install node dependencies
    yarn install

### Import database

Download database from [data.ghentcdh.ugent.be](https://data.ghentcdh.ugent.be) and import using

    echo "create database db_dibe" | sudo mysql
    sudo mysql --database=db_dibe < db_dibe.sql

Create user and set permissions

    sudo mysql < ./scripts/create-user.sql

### Create/Update Elasticsearch index

    php bin/console app:elasticsearch:index charter

### Run application

Start the back-end dev server

    symfony server:start --no-tls

Site is available on these addresses:

    http://dibe.vagrant:8000
    http://localhost:8000

### Build js/css

    encore dev --watch
    
If encore is not available, use

    node_modules/.bin/encore dev

## Misc

encore dev --watch

### Pull qas build

    git pull
    php7.4 bin/console cache:clear --env=qas

### Pull prod build

    git pull
    php7.4 bin/console cache:clear --env=prod


































































