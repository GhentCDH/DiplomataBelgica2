#!/bin/sh
cd /app

# Start SSH agent
eval "$(ssh-agent -s)"
echo "$SSH_AUTH_SOCK"
# Add all SSH keys in /home/.ssh directory
for key in ~/.ssh/*; do
    ssh-add "$key"
done

# install backend dependencies
echo "Installing backend dependencies"
composer install
#echo "Dumping environment variables to .env.local.php"
#composer dump-env dev

# clear cache
echo "Clearing cache..."
rm -rf /root/.symfony5
php bin/console cache:clear

# wait for Elasticsearch to be up
until curl -s "elasticsearch:9200" > /dev/null; do
    echo "Waiting for Elasticsearch to be up..."
    sleep 5
done

# check elasticsearch indices
# returns the HTTP status of a HEAD request on the given index (security is on, so send credentials)
index_status() {
    curl -s -o /dev/null -w '%{http_code}' -I \
        -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
        "${ELASTICSEARCH_HOST:-elasticsearch}:${ELASTICSEARCH_PORT:-9200}/$1"
}

# only (re)create an index when Elasticsearch says it does not exist (404);
# any other status (401, 5xx, ...) is logged and the index is left alone
ensure_index() {
    index="${ELASTICSEARCH_INDEX_PREFIX}_$1"
    status=$(index_status "$index")
    case "$status" in
        200) echo "Index $index already exists" ;;
        404)
            echo "Creating $1 index (100 records max) ..."
            php bin/console app:elasticsearch:index "$1" 100
            ;;
        *) echo "Could not check index $index (HTTP $status), not creating it" ;;
    esac
}

ensure_index charter
ensure_index tradition

# start the symfony server
echo "Starting server..."
symfony server:stop
symfony local:server:start --port=8000 --no-tls --allow-all-ip