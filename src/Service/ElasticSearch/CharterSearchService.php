<?php

namespace App\Service\ElasticSearch;

use Elastica\Mapping;
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

            // filter by language.id
            'charter_language' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'language'
            ],

            'charter_place_name' => [
                'type' => self::FILTER_KEYWORD,
                'field' => 'place.name'
            ],
            
            'has_images' => [
                'type' => self::FILTER_EXISTS,
                'field' => 'has_images'
            ],

            'dating_scholary_nested' => [
                'type' => self::FILTER_NESTED_MULTIPLE,
                'nested_path' => 'datations',
                'aggregationFilter' => false, // filter can be applied before aggregations
                'filters' => [
                    'dating_scholary' => [
                        'type' => self::FILTER_DMY_RANGE,
                        'field' => 'time'
                    ],
                    'dating_scholary_preferential' => [
                        'type' => self::FILTER_BOOLEAN,
                        'field' => 'preference',
                        'only_filter_on_true' => true,
                        'true_value' => 1,
                        'false_value' => 0
                    ]
                ]
            ],

            'dating_charter' => [
                'type' => self::FILTER_DMY_RANGE,
                'aggregationFilter' => false, // filter can be applied before aggregations
                'nested_path' => 'udt',
                'field' => ''
            ]
        ];

        $searchFilters['actors'] = [
            'type' => self::FILTER_NESTED_MULTIPLE,
            'nested_path' => 'actors',
            'filters' => [
                'actor_name_full_name' => [
                    'field' => 'name.full_name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_place_name' => [
                    'field' => 'place.name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_place_diocese_name' => [
                    'field' => 'place.diocese.name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_place_principality_name' => [
                    'field' => 'place.principality.name',
                    'type' => self::FILTER_KEYWORD
                ],
                'actor_capacity' => [
                    'field' => 'capacity',
                    'type' => self::FILTER_OBJECT_ID
                ],
                'actor_role' => [
                    'field' => 'role',
                    'type' => self::FILTER_OBJECT_ID
                ],
                'actor_order_name' => [
                    'field' => 'order.name',
                    'type' => self::FILTER_KEYWORD
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
            'charter_language' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'language'
            ],
            'charter_place_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.name',
                'aggregations' => [
                    'latitude' => [
                        'type' => self::AGG_KEYWORD,
                        'field' => 'place.latitude'
                    ],
                    'longitude' => [
                        'type' => self::AGG_KEYWORD,
                        'field' => 'place.longitude'
                    ]
                ]
            ],
            'actor_name_full_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'name.full_name',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_place_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.name',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_place_diocese_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.diocese.name',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_place_principality_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'place.principality.name',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_capacity' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'capacity',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_role' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'role',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
            ],
            'actor_order_name' => [
                'type' => self::AGG_KEYWORD,
                'field' => 'order.name',
                'nested_path' => 'actors',
                'excludeFilter' => [ 'actors' ],
                'filters' => $searchFilters['actors']['filters']
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
        $returnProps = ['id', 'published', 'summary', 'actors','udt','date'];

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
                case 'date':
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
