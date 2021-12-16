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
                // 'field' => 'languages.id' // field is derived from filter name 'languages'
            ],
            // filter by place.id
            'place' => [
                'type' => self::FILTER_OBJECT_ID,
                // 'field' => 'place.id' // field is derived from filter name 'place'
            ],
            // filter by actor property
            'actor_place' => [
                'type' => self::FILTER_NESTED_ID,
                'nested_path' => 'actors',
                'field' => 'actors.place.id'
            ],
        ];

        return $searchFilters;
    }

    protected function getAggregationConfig(): array {
        $aggregationFilters = [
            'languages' => ['type' => self::AGG_OBJECT_ID_NAME],
            'place' => ['type' => self::AGG_OBJECT_ID_NAME],
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

    protected function sanitizeSearchParameters(array $params): array
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
