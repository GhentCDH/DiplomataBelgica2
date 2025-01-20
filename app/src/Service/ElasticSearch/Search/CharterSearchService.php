<?php

namespace App\Service\ElasticSearch\Search;

use App\Helper\DibeQueryToElasticQuery;
use App\Service\ElasticSearch\Base\AbstractSearchService;

class CharterSearchService extends AbstractSearchService
{
    const indexName = "charter";
    private int $actorLimit = 3;

    protected function initSearchConfig(): array {
        $searchFilters = [
            'id' => ['type' => self::FILTER_NUMERIC],

            // filter by language.id
            'charter_language' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'language'
            ],

            'charter_place_name' => [
                'type' => self::FILTER_OBJECT_ID,
                'field' => 'place'
            ],
            
            'has_images' => [
                'type' => self::FILTER_EXISTS,
                'field' => 'has_images'
            ],

            'dating_scholary_nested' => [
                'type' => self::FILTER_NESTED_MULTIPLE,
                'nestedPath' => 'datations',
                'aggregationFilter' => false, // filter can be applied before aggregations
                'filters' => [
                    'dating_scholary' => [
                        'type' => self::FILTER_DMY_RANGE,
                        'field' => 'time'
                    ],
                    'dating_scholary_preferential' => [
                        'type' => self::FILTER_BOOLEAN,
                        'field' => 'preference',
                        'onlyFilterIfTrue' => true,
                        'trueValue' => 0,
                        'falseValue' => 1
                    ]
                ]
            ],

            'dating_charter' => [
                'type' => self::FILTER_DMY_RANGE,
                'aggregationFilter' => false, // filter can be applied before aggregations
                'field' => 'udt'
            ],

            'fulltext' => [
                'type' => self::FILTER_QUERYSTRING,
                'aggregationFilter' => false, // filter can be applied before aggregations
                'field' => '*'
            ],

            'summary' => [
                'type' => self::FILTER_QUERYSTRING,
                'aggregationFilter' => false, // filter can be applied before aggregations
                'field' => 'summary'
            ]
        ];

        // actor filters
        foreach( range(1, $this->actorLimit) as $index ) {
            $searchFilters["actors_{$index}"] = [
                'type' => self::FILTER_NESTED_MULTIPLE,
                'nestedPath' => 'actors',
                'filters' => [
                    "actor_name_full_name_{$index}:prefix" => [
                        'field' => 'name.name.normalized_text',
//                        'type' => self::FILTER_TEXT_PREFIX,
                        'type' => self::FILTER_KEYWORD_PREFIX,
                    ],
                    "actor_name_full_name_{$index}" => [
                        'field' => 'name',
                        'type' => self::FILTER_OBJECT_ID
                    ],
//                    "actor_name_full_name_{$index}" => [
//                        'field' => 'name',
//                        'type' => self::FILTER_OBJECT_ID
//                    ],
                    "actor_place_name_{$index}" => [
                        'field' => 'place',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                    "actor_place_diocese_name_{$index}" => [
                        'field' => 'place.diocese',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                    "actor_place_principality_name_{$index}" => [
                        'field' => 'place.principality',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                    "actor_capacity_{$index}" => [
                        'field' => 'capacity',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                    "actor_role_{$index}" => [
                        'field' => 'role',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                    "actor_order_name_{$index}" => [
                        'field' => 'order',
                        'type' => self::FILTER_OBJECT_ID
                    ],
                ],
            ];
        }

        return $searchFilters;
    }

    protected function initAggregationConfig(): array {
        $searchFilters = $this->getSearchConfig();

        $aggregationFilters = [
            'charter_language' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'language'
            ],

            'charter_place_name' => [
                'type' => self::AGG_OBJECT_ID_NAME,
                'field' => 'place',
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
        ];

        // actor filters
        foreach( range(1, $this->actorLimit) as $index ) {
            $agg = [
                "actor_name_full_name_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'name',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                    'safeLimit' => 100,
                ],
                "actor_place_name_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'place',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
                "actor_place_diocese_name_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'place.diocese',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
                "actor_place_principality_name_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'place.principality',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
                "actor_capacity_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'capacity',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
                "actor_role_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'role',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
                "actor_order_name_{$index}" => [
                    'type' => self::AGG_OBJECT_ID_NAME,
                    'field' => 'order',
                    'nestedPath' => 'actors',
                    'filters' => $searchFilters[ "actors_{$index}" ]['filters'],
                ],
            ];
            if ($index > 1) {
                foreach($agg as $key => $value) {
                    $agg[$key]['condition'] = $this->actorCondition($index);
                }
            }
            $aggregationFilters = array_merge($aggregationFilters, $agg);
        }

        return $aggregationFilters;
    }

    protected function getDefaultSearchParameters(): array {
        return [
            'limit' => 25,
            'page' => 1,
            'ascending' => 1,
            'orderBy' => ['date_sort'],
        ];
    }

    protected function sanitizeSearchResult(array $result): array
    {
        $returnProps = ['id', 'published', 'summary', 'actors','datations', 'date_sort'];

        $result = array_intersect_key($result, array_flip($returnProps));

        return $result;
    }

    protected function sanitizeSearchParameters(array $params, bool $merge_defaults = true): array
    {
        // convert orderBy field to elastic field expression
        if (isset($params['orderBy'])) {
            switch ($params['orderBy']) {
                case 'id':
                case 'date_sort':
                    $params['orderBy'] = [ $params['orderBy'] ];
                    break;
                default:
                    unset($params['orderBy']);
                    break;
            }
        }
        return parent::sanitizeSearchParameters($params);
    }

    protected function sanitizeSearchFilters(array $params): array
    {
        // convert summary/fulltext search syntax
        if (isset($params['summary'])) {
            $params['summary'] = DibeQueryToelasticQuery::translate($params['summary']);
        }
        if (isset($params['fulltext'])) {
            $params['fulltext'] = DibeQueryToelasticQuery::translate($params['fulltext']);
        }

        return parent::sanitizeSearchFilters($params);
    }

    protected function actorCondition(int $index): \Closure
    {
        $getActorProperties = fn($i) => [
            "actor_name_full_name_{$i}",
            "actor_place_name_{$i}",
            "actor_place_diocese_name_{$i}",
            "actor_place_principality_name_{$i}",
            "actor_capacity_{$i}",
            "actor_role_{$i}",
            "actor_order_name_{$i}",
        ];

        return function($aggName, $aggConfig, $arrFilterValues) use ($index, $getActorProperties) {
            // check if any of the current & previous actor filters have a value
            $indexes = array_filter([$index, $index > 1 ? ($index - 1) : null]);
            foreach($indexes as $i) {
                $actorProperties = $getActorProperties($i);
                foreach($actorProperties as $actorProperty) {
                    if (isset($arrFilterValues[$actorProperty]) && $arrFilterValues[$actorProperty]['value']) {
                        return true;
                    }
                }
            }
            return false;
        };
    }
}
