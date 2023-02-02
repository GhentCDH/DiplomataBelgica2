<?php

namespace App\Service\ElasticSearch;

use Elastica\Mapping;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TraditionSearchService extends AbstractSearchService
{
    const indexName = "tradition";

    public function __construct(Client $client)
    {
        parent::__construct(
            $client,
            self::indexName);
    }

    protected function getSearchFilterConfig(): array {
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

    protected function getAggregationConfig(): array {
        $searchFilters = $this->getSearchFilterConfig();

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
            'orderBy' => ['id'],
        ];
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
                    $params['orderBy'] = [ $params['orderBy'] ];
                    break;
                default:
                    unset($params['orderBy']);
                    break;
            }
        }

        return parent::sanitizeSearchParameters($params);
    }

}
