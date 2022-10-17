<?php

namespace App\Service\ElasticSearch;

class TraditionIndexService extends AbstractIndexService
{
    const indexName = "tradition";

    public function __construct(Client $client)
    {
        parent::__construct(
            $client,
            self::indexName);
    }

    protected function getMappingProperties(): array {
        return [
//            'place' => ['type' => 'object'],
//            'udt' => ['type' => 'nested'],
        ];
    }

    protected function getIndexProperties(): array {
        return [
//            'settings' => [
//                'analysis' => Analysis::ANALYSIS
//            ]
        ];
    }
}