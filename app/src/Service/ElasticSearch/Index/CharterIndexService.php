<?php

namespace App\Service\ElasticSearch\Index;

use App\Service\ElasticSearch\Analysis;
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
            'place' => ['type' => 'object',
                'properties' => [
                    'hash' => [
                        'type' => 'keyword',
                    ],
                    'name' => [
                        'type' => 'keyword',
                    ],
                    'latitude' => [
                        'type' => 'keyword',
                    ],
                    'longitude' => [
                        'type' => 'keyword',
                    ]
                ]],
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
                    ],
                    'label' => [
                        'type' => 'keyword',
                    ],
                    'place.latitude' => [
                        'type' => 'keyword',
                    ],
                    'place.hash' => [
                        'type' => 'keyword',
                    ],
                    'place.longitude' => [
                        'type' => 'keyword',
                    ],
                    'place.name' => [
                        'type' => 'keyword',
                    ]
                ]
            ],
            'datations' => ['type' => 'nested'],
            'udt' => ['type' => 'nested'],
            'date_sort' => ['type' => 'long'],
            // bundle for the plain full-text search (filters[q]), see ElasticCharterResource::searchText()
            'search_text' => [
                'type' => 'object',
                'properties' => array_fill_keys(
                    ['summary', 'actor_names', 'place_date', 'actor_places', 'full_text'],
                    ['type' => 'text', 'analyzer' => 'search_text'],
                ),
            ],
        ];
    }

    protected function getIndexProperties(): array {
        $analysis = [
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
        ];

        // full-text search bundle: the Latin texts are normalized to u and i, so map v and j the same way
        // ("vniversis" finds "uniuersis")
        $searchText = Analysis::searchTextAnalysis(['v => u', 'V => U', 'j => i', 'J => I'], 'search_text', 'latin_uv_ij');

        return [
            'settings' => [
                'analysis' => array_replace_recursive($analysis, $searchText),
            ],
        ];
    }
}
