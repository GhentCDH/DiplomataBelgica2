# AGENTS.md

Guidance for AI coding agents (and humans) working on **Diplomata Belgica (DiBe)**, a search and browse
application for medieval charters ("chartes") and their tradition (originals, copies, manuscripts).
Live site: https://www.diplomata-belgica.be/ — GitHub: `GhentCDH/DiplomataBelgica2`.

## Stack

| Layer      | Technology                                                                                         |
|------------|----------------------------------------------------------------------------------------------------|
| Backend    | PHP 8.2, Symfony 5.4, **Eloquent ORM** (`wouterj/eloquent-bundle`, *not* Doctrine)                 |
| Database   | MariaDB 10.11 (schema + data loaded from `initdb/` on first start)                                 |
| Search     | Elasticsearch 7 (via `ruflin/elastica`), xpack security on                                         |
| Frontend   | Vue 3.5 + TypeScript/JS, Vite 6 (`vite-plugin-symfony` / `pentatrion/vite-bundle`), Bootstrap 5    |
| Shared lib | `@ghentcdh/vue-search-kit` (GitHub dep, aliased to its **source** in `vite.config.mjs`)            |
| Tooling    | Docker Compose, pnpm 9, Node 22                                                                    |

## Repository layout

```
compose.yaml / compose.prd.yaml   dev / production stacks (project name dibe-dev)
Dockerfile                        targets: dev, node-dev, prod
initdb/                           010-schema.sql, 020-data.sql (gitignored full dump), 030-create-user.sql
doc/search_syntax.md              user-facing search syntax
app/
  src/
    Controller/                   BaseController (shared search/paginate logic), CharterController,
                                  TraditionController, DefaultController (static pages), HealthController
    Command/                      IndexElasticsearchCommand (app:elasticsearch:index)
    Model/                        Eloquent models; Traits for custom schema + localized attributes
    Repository/                   query builders feeding the indexer (IndexProviderInterface)
    Resource/ElasticSearch/       turn models into ES documents (ElasticCharterResource, ElasticActorResource,
                                  ElasticTraditionResource, ...)
    Service/ElasticSearch/        Base/ (Client, AbstractSearchService: filters, aggregations, sorting),
                                  Index/ (mappings), Search/ (Charter/Tradition search config)
    Helper/DibeQueryToElasticQuery.php   DiBe search syntax -> ES query
  assets/js/
    apps/                         Vite entry points: charter-search, charter-view, tradition-search, tradition-view, main
    components/                   Charter/, Tradition/, Actor/, Sidebar/, image viewers
    composables/                  useSearchSyntax (chevrotain parser), useTextMarker, useUrlGenerator
    repositories/                 axios API clients
    locales/                      en.json, fr.json, i18n.js (vue-i18n)
  templates/                      Twig: base, blocks/navbar, pages/{charter,tradition}/{search,detail},
                                  static pages per locale (*.en.html.twig / *.fr.html.twig)
  translations/                   Symfony XLIFF (FR only; EN uses source strings)
  migrations/                     numbered raw SQL scripts (no Doctrine migrations)
```

## How things fit together

- **Routes** are annotation-based (`@Route`) with a `{_locale}` prefix: `/{_locale}/charters`,
  `/{_locale}/charters/{id}`, `/{_locale}/charters/search|paginate|locate|aggregation_suggest`,
  `/{_locale}/tradition/search|search_api|paginate`, `/{_locale}/tradition/{tradition_type}/{id}` (locales: `en`,
  `fr`; a legacy `/tradition/paginate` without locale searches the English index). Detail routes return JSON when
  the request accepts `application/json`.
- **Twig -> Vue**: page templates mount a Vue app via `vite_entry_script_tags('<entry>')` and pass backend URLs
  through an `init-urls` attribute (`BaseController::getSharedAppUrls()` -> `composables/useUrlGenerator.ts`).
- **Search state** is handled by vue-search-kit composables (`useSearchApp`, `useSearchContext`,
  `useSearchHistory`): filters live in the query string (pushState); detail pages carry the search context in
  the URL hash (`#hash:index`) for prev/next navigation.
- **Indexing**: `Repository::indexQuery()` -> `Resource/ElasticSearch/*Resource` -> `Index/*IndexService`
  (`getMappingProperties()`). There is **one index per locale** (`elasticsearch.index_locales`): the indexer
  serializes every chunk once per locale, builds new indexes and swaps the aliases
  `${ELASTICSEARCH_INDEX_PREFIX}_charter_{en,fr}` and `_tradition_{en,fr}` when all locales are done. The
  search/index services are locale aware (`kernel.locale_aware`): requests use the index of the URL locale.
  **Any change to resources or mappings requires a reindex.**

## Internationalisation (EN / FR)

There are three independent mechanisms. Check all of them when fixing a translation:

1. **Twig/Symfony**: `app/translations/messages+intl-icu.fr.xlf`. Symfony uses the `resname` attribute as the
   key when present, so `resname` must equal the string used in `'...'|trans`.
2. **Vue**: `app/assets/js/locales/{en,fr}.json` (vue-i18n; locale taken from the first URL path segment).
   An empty string `""` is a valid message and does **not** fall back to English. vue-search-kit components
   carry their own `<i18n>` blocks and some hardcoded strings.
3. **Data**: lookup tables have `name_nl/name_fr/name_en` columns resolved by `Model/TraitLocalizedAttributes`.
   Empty values fall back to English, then French. Values are resolved when a document is serialized for the
   index of its locale, so data changes only show after a reindex.

Static pages (about, colophon, contact, copyright, search syntax) are separate templates per locale.

## Development

```sh
docker compose up --build            # app on http://localhost:${APP_EXTERNAL_PORT} (8090 in .env), Vite on :5173
```

- The symfony container entrypoint (`app/scripts/docker-startup-script.sh`) runs `composer install`, clears the
  cache, and creates ES indexes **capped at 100 records** if they are missing.
- Full reindex: `docker exec dibe-dev-symfony-1 bin/console app:elasticsearch:index charter` (and `tradition`),
  optionally with a max item count; or `app/scripts/reindex.sh [n]` inside the container. A full charter index
  takes a while.
- Frontend (inside `app/` or the node container): `pnpm dev`, `pnpm build`, `pnpm test` (vitest; currently no
  test files). The `analyze` script is stale (still calls Encore).
- Console: `docker exec dibe-dev-symfony-1 bin/console ...`. DB and ES ports are not exposed to the host; use
  `docker exec` into `dibe-dev-mariadb-1` / `dibe-dev-elasticsearch-1`.
- Changes to vue-search-kit must be made in `GhentCDH/vue-search-kit`, not in `node_modules`.

## Conventions

- Commits: Conventional Commits, lowercase type, no scope (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`,
  `test:`). Branches: `feat/...`, `fix/...`, `chore/...`, `refactor/...`. Work lands via PRs to `main`.
- No linters/formatters are configured; match the style of surrounding code (PHP: PSR-12-ish, annotations for
  routes; Vue: `<script setup>` with `lang="ts"` in newer components).
- Domain vocabulary: *charter* (charte), *tradition* = original | copy | manuscript (codex), *actor* with a
  *role* per charter (1 = disposant / author of the actio juridica, 2 = issuer / auteur, 3 = beneficiary),
  *capacity* (function/title), *datation* (preference 0 = scholarly dating, preferential), *place-date*.

## Gotchas

- README refers to `example.env`, which does not exist; the committed root `.env` holds dev defaults.
  Secrets go in `.env.local` / environment (gitignored).
- `config/packages/{prod,qas,test}/webpack_encore.yaml` are leftovers from the Encore era.
- `initdb/` scripts only run when the MariaDB volume (`var/mysql`) is empty.
