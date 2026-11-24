<?php

namespace App\Resource\ElasticSearch;

/**
 * Collects the values of a full-text search bundle (the search_text.* sub-fields of a document).
 *
 * Values are flattened, trimmed and deduplicated per field; empty values and the string 'NULL'
 * (found in some text columns) are dropped. Fields without values are left out.
 */
class SearchTextBuilder
{
    /** @var array<string, string[]> */
    private array $fields = [];

    public function add(string $field, mixed ...$values): static
    {
        $this->fields[$field] ??= [];
        array_walk_recursive($values, function ($value) use ($field) {
            if (!is_scalar($value)) {
                return;
            }
            $value = trim((string) $value);
            if ($value === '' || $value === 'NULL' || in_array($value, $this->fields[$field], true)) {
                return;
            }
            $this->fields[$field][] = $value;
        });

        return $this;
    }

    /**
     * @return array<string, string[]>
     */
    public function toArray(): array
    {
        return array_filter($this->fields, fn(array $values) => count($values) > 0);
    }
}
