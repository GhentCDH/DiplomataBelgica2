<?php

namespace App\Service\ElasticSearch;

class CharterIndexService extends AbstractIndexService
{
    const indexName = "charters";

    public function __construct(Client $client)
    {
        parent::__construct(
            $client,
            self::indexName);
    }

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