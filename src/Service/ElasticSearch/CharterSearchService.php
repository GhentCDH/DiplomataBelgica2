<?php

namespace App\Service\ElasticSearch;

use Elastica\Mapping;
use Elastica\Settings;
use Symfony\Component\DependencyInjection\ContainerInterface;

class CharterSearchService extends AbstractSearchService
{
    const indexName = "charters";

    public function __construct(Client $client)
    {
        parent::__construct(
            $client,
            self::indexName);
    }

    protected function getSearchFilterConfig(): array {
        $searchFilters = [
            'id' => ['type' => self::FILTER_NUMERIC],

            // filter by languages.id
            'languages' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'languages.id'
            ],
            // filter by place.id
            'place' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'place.id'
            ],
        ];

        $searchFilters['actors'] = [
            'type' => self::FILTER_NESTED_MULTIPLE,
            'nested_path' => 'actors',
            'filters' => [
                'actor_place_name' => [
                    'field' => 'place.name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_place_diocese' => [
                    'field' => 'place.diocese_name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_place_principality' => [
                    'field' => 'place.principality_name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_capacity' => [
                    'field' => 'capacity.capacity',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_role' => [
                    'field' => 'role',
                    'type' => self::FILTER_OBJECT_ID
                ],
            ],
            'innerHits' => [
                'size' => 100
            ]
        ];

        return $searchFilters;
    }

    protected function getAggregationConfig(): array {
        $searchFilters = $this->getSearchFilterConfig();

        $aggregationFilters = [
            'languages' => ['type' => self::AGG_OBJECT_ID_NAME],
            'actor_place_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.name',
                'nested_path' => 'actors',
                'filter' => $searchFilters['actors']
            ],
            'actor_place_diocese' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.diocese_name',
                'nested_path' => 'actors',
                'filter' => $searchFilters['actors']
            ],
            'actor_place_principality' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.principality_name',
                'nested_path' => 'actors',
                'filter' => $searchFilters['actors']
            ],
            'actor_capacity' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'capacity.capacity',
                'nested_path' => 'actors',
                'filter' => $searchFilters['actors']
            ],
            'actor_role' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'role',
                'nested_path' => 'actors',
                'filter' => $searchFilters['actors']
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

    protected function sanitizeSearchResult(array $result): array
    {
        $returnProps = ['id', 'published', 'summary'];

        $result = array_intersect_key($result, array_flip($returnProps));

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
