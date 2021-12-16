# DiBe

### Pull production build

    git pull
    php7.4 bin/console cache:clear --env=qas

### Import database

    sudo -u postgres psql db_dibe < dump-evwrit-xxxxxxxx.sql

### Update Elasticsearch index

    php bin/console app:elasticsearch:index charter

