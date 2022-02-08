# DiBe

## Development

### Watch js/css 

    encore build --watch

### Build production js/css

    # create production build
    yarn encore production

    # commit & push build
    git add public/build
    git commit -m "production build"
    git push

    # to continue dev, create dev build and clear cache 
    yarn encore dev
    ./bin/console cache:clear

## Production

### Pull production build

    git pull
    php7.4 bin/console cache:clear --env=prod

### Update dependencies

JS dependencies

    yarn install

PHP dependencies

    composer install

### Import database

    sudo -u postgres psql db_dibe < dump-dibe-xxxxxxxx.sql

### Update Elasticsearch index

    php bin/console app:elasticsearch:index charter

