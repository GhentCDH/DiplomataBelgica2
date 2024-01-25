<?php

namespace App\Service\ElasticSearch\Index;

use App\Service\ElasticSearch\Base\AbstractIndexService;

class TraditionIndexService extends AbstractIndexService
{
    const indexName = "tradition";

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