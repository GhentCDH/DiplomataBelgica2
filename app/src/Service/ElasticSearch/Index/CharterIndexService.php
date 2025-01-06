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
            'actors' => [
                'type' => 'nested',
                'properties' => [
                    'name.name' => [
                        'type' => 'keyword',
                        'fields' => [
                            'normalized_text' => [
                                'type' => 'keyword',
                                'normalizer' => 'icu_normalizer',
                            ]
                        ]
                    ]
                ]
            ],
            'datations' => ['type' => 'nested'],
            'date' => ['type' => 'long'],
        ];
    }

    protected function getIndexProperties(): array {
        return [
            'settings' => [
                'analysis' => [
                    "char_filter" => [
                        "remove_special" => [
                            "type" => "pattern_replace",
                            "pattern" => "[\\p{Punct}]",
                            "replacement" > "",
                        ],
                        "numbers_last" => [
                            "type" => "pattern_replace",
                            "pattern" => "([0-9])",
                            "replacement" => "zzz$1",
                        ],
                    ],
                    'normalizer' => [
                        'icu_normalizer' => [
                            "char_filter" => [
                                "remove_special",
                                "numbers_last",
                            ],
                            "filter" => [
                                "icu_folding",
                                "lowercase",
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}