<?php

namespace App\Service\ElasticSearch\Index;

use App\Service\ElasticSearch\Base\AbstractIndexService;

class CharterIndexService extends AbstractIndexService
{
    const indexName = "charter";

    protected function getMappingProperties(): array {
        return [
            'full_text' => [
                'type' => 'text',
            ],
            'full_text_annotated' => [
                'type' => 'text',
            ],
            'full_text_stripped' => [
                'type' => 'text',
            ],
            'place' => ['type' => 'object'],
            'languages' => ['type' => 'object'],
            'actors' => ['type' => 'nested'],
            'datations' => ['type' => 'nested'],
            'udt' => ['type' => 'nested'],
            'date' => ['type' => 'long'],
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