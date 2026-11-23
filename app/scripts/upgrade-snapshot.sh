#!/usr/bin/env bash
# Regression snapshot for framework/ORM upgrades. Run on the HOST (needs docker + jq), from anywhere:
#
#   app/scripts/upgrade-snapshot.sh <outdir> [charter_max] [tradition_max]
#
# Writes to <outdir>:
#   routes.json            route names, paths, defaults, requirements (debug:router)
#   es/<index>.jsonl       every document of a fresh sample index, one sorted JSON line per doc
#   http/<name>.txt        status code, redirect target and body of the main pages and API endpoints
#                          (JSON normalized; HTML requested as XHR so the web debug toolbar is not injected)
#
# The sample index uses its own prefix (SNAPSHOT_PREFIX, default dibe_snap), so the dev indexes are untouched.
# HTTP checks run against the dev indexes. Set SKIP_ES=1 to skip the (slow) index part.
# Compare two snapshots with: diff -r <before> <after>
set -euo pipefail

out=${1:?usage: upgrade-snapshot.sh <outdir> [charter_max] [tradition_max]}
charter_max=${2:-1000}
tradition_max=${3:-}
container=${SYMFONY_CONTAINER:-dibe-dev-symfony-1}
prefix=${SNAPSHOT_PREFIX:-dibe_snap}

mkdir -p "$out/es" "$out/http"
in_app() { docker exec "$container" sh -c "cd /app && $1"; }
es() { docker exec "$container" sh -c "curl -s -u \"\$ELASTICSEARCH_USERNAME:\$ELASTICSEARCH_PASSWORD\" -H 'Content-Type: application/json' $1"; }
es_url=$(docker exec "$container" sh -c 'echo "${ELASTICSEARCH_HOST:-elasticsearch}:${ELASTICSEARCH_PORT:-9200}"')

# 1. routes
in_app 'bin/console debug:router --format=json' \
  | jq -S 'with_entries(.value |= del(.class, .defaults._controller))' > "$out/routes.json"
in_app 'bin/console debug:router --format=json' \
  | jq -S 'with_entries(.value |= {path, method, defaults})' > "$out/routes-controllers.json"

# 2. sample indexes (models -> resources -> ES documents)
if [ -z "${SKIP_ES:-}" ]; then
in_app "ELASTICSEARCH_INDEX_PREFIX=$prefix bin/console app:elasticsearch:index charter $charter_max -q"
in_app "ELASTICSEARCH_INDEX_PREFIX=$prefix bin/console app:elasticsearch:index tradition $tradition_max -q"
for index in charter_en charter_fr tradition_en tradition_fr; do
  file="$out/es/$index.jsonl"
  : > "$file"
  page=$(es "'$es_url/${prefix}_${index}/_search?scroll=2m&size=1000'")
  if [ "$(jq 'has("error") or (.hits.hits | length) == 0' <<<"$page")" = true ]; then
    echo "no documents in ${prefix}_${index}: $(head -c 300 <<<"$page")" >&2
    exit 1
  fi
  while :; do
    n=$(jq '.hits.hits | length' <<<"$page")
    [ "$n" -eq 0 ] && break
    jq -cS '.hits.hits[] | {_id, _source}' <<<"$page" >> "$file"
    scroll_id=$(jq -r '._scroll_id' <<<"$page")
    page=$(es "-d '{\"scroll\":\"2m\",\"scroll_id\":\"$scroll_id\"}' $es_url/_search/scroll")
  done
  sort -o "$file" "$file"
  echo "$index: $(wc -l < "$file") documents"
done
fi

# 3. HTTP endpoints (status + body; JSON bodies normalized)
http() {
  local name=$1 url=$2 accept=${3:-text/html}
  local body meta
  body=$(docker exec "$container" curl -s -H "Accept: $accept" -H 'X-Requested-With: XMLHttpRequest' \
    -w '\n%{http_code} %{redirect_url}' "http://localhost:8000$url")
  meta=${body##*$'\n'}
  body=${body%$'\n'*}
  {
    echo "GET $url ($accept) -> $meta"
    if [ "$accept" = application/json ]; then
      jq -S 'del(.. | .took?, .debug?)' <<<"$body" 2>/dev/null || echo "$body"
    else
      echo "$body"
    fi
  } > "$out/http/$name.txt"
}

json=application/json
http home /
http home_en /en/
http about_fr /fr/about
http copyright_en /en/copyright
http contact_en /en/contact
http colophon_fr /fr/colophon
http charters_en /en/charters
http charter_html /en/charters/510
http charter_json_en /en/charters/510 $json
http charter_json_fr /fr/charters/511 $json
http charter_missing /en/charters/999999999 $json
http charter_search_syntax /en/charters/search_syntax
http charter_search /en/charters/search $json
http charter_search_summary '/en/charters/search?summary=abbatia&limit=5' $json
http charter_search_page2 '/fr/charters/search?page=2&limit=10' $json
http charter_paginate '/en/charters/paginate?summary=abbatia' $json
http charter_locate '/en/charters/locate?summary=abbatia' $json
http charter_aggregation_suggest '/en/charters/aggregation_suggest?field=place&value=gent' $json
http tradition_en /en/tradition
http tradition_search /en/tradition/search
http tradition_search_api /en/tradition/search_api $json
http tradition_paginate /en/tradition/paginate $json
http tradition_paginate_legacy /tradition/paginate $json
http tradition_original_json /en/tradition/original/3808 $json
http tradition_copy_json /fr/tradition/copy/5 $json
http tradition_manuscript_json /en/tradition/manuscript/1 $json
http tradition_original_html /en/tradition/original/3808
http health /health
echo "snapshot written to $out"
