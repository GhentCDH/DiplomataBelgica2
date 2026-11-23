<?php

namespace App\Service\ElasticSearch\Search;

use App\Service\ElasticSearch\Base\AbstractSearchService;

class TraditionSearchService extends AbstractSearchService
{
    const indexName = "tradition";

    protected function initSearchConfig(): array {
        $searchFilters = [
            'repository_name' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'repository',
                'aggregationFilter' => true,
            ],

            'repository_location' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'repository.location',
                'aggregationFilter' => true,
            ],

            'repository_reference_number' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'repository_reference_number',
                'aggregationFilter' => true,
            ],

            'tradition_type' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'type',
                'aggregationFilter' => true,
            ],

            'has_images' => [
                'type' => self::FILTER_EXISTS,
                'field' => 'has_images'
            ],

            'codex_title' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'title',
            ],
            'codex_stein_number' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'stein_number',
            ],
            'codex_material' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'materials',
            ],
            'codex_institutions' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'institutions',
            ],

        ];

        return $searchFilters;
    }

    protected function initAggregationConfig(): array {

        $aggregationFilters = [
            'repository_name' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'repository'
            ],

            'repository_location' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'repository.location'
            ],

            'repository_reference_number' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'repository_reference_number'
            ],

            'tradition_type' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'type',
                'replaceLabel' => [
                    'search' => 'codex',
                    'replace' => 'manuscript'
                ]
            ],
            'codex_title' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'title',
            ],
            'codex_stein_number' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'stein_number',
            ],
            'codex_material' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'materials',
            ],
            'codex_institutions' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'institutions',
            ],
        ];

        return $aggregationFilters;
    }

    protected function getDefaultSearchParameters(): array {
        return [
            'limit' => 25,
            'page' => 1,
            'ascending' => 1,
            'orderBy' => ['id', 'type.keyword'],
        ];
    }

    /**
     * Unique key of a tradition record: "type:id" (ids overlap between originals, copies and manuscripts).
     */
    public static function resultKey(array $result): string
    {
        return $result['type'].':'.$result['id'];
    }

    protected function sanitizeSearchResult(array $result): array
    {
        $result['key'] = self::resultKey($result);
        return $result;
    }

   protected function sanitizeSearchParameters(array $params, bool $merge_defaults = true): array
    {
        // convert orderBy field to elastic field expression
        if (isset($params['orderBy'])) {
            switch ($params['orderBy']) {
                case 'title':
                    $params['orderBy'] = ['title.keyword'];

                    break;
                case 'id':
                    // ids overlap between types: add type as tie-breaker for a stable order
                    $params['orderBy'] = [ 'id', 'type.keyword' ];
                    break;
                default:
                    unset($params['orderBy']);
                    break;
            }
        }

        return parent::sanitizeSearchParameters($params);
    }

}
