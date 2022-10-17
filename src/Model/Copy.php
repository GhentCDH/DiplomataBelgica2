<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int copy_id
 * @property boolean loose
 * @property boolean published
 * @property int charter_id
 * @property boolean charter_published
 * @property int codex_id
 * @property string codex_pof
 * @property string codex_sequence_number
 * @property boolean codex_published
 * @property int repository_id
 * @property string repository_reference_number
 * @property boolean repository_published
 *
 * @package App\Model
 */

class Copy extends AbstractTraditionModel
{
    protected $casts = [
        'loose' => 'boolean',
        'published' => 'boolean',
        'charter_published' => 'boolean',
        'codex_published' => 'boolean',
        'repository_published' => 'boolean'
    ];
    protected $with = [
        'codex', 'repository', 'imageUrls', 'urls', 'images'
    ];

    public function traditionType(): string
    {
        return 'copy';
    }

    /**
     * @return BelongsTo|Codex
     * @throws ReflectionException
     */
    public function codex(): BelongsTo
    {
        return $this->belongsTo(Codex::class);
    }

}
