<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int original_id
 * @property boolean published
 * @property int charter_id
 * @property boolean charter_published
 * @property int codex_id
 * @property boolean codex_published
 * @property int repository_id
 * @property string repository_reference_number
 * @property boolean repository_published
 *
 * @package App\Model
 */

class Original extends AbstractTraditionModel
{
    protected $casts = [
        'published' => 'boolean',
        'charter_published' => 'boolean',
        'codex_published' => 'boolean',
        'repository_published' => 'boolean'
    ];
    protected $with = [
        'codex', 'repository', 'images', 'imageUrls', 'urls'
    ];

    public function traditionType(): string
    {
        return 'original';
    }

    /**
     * @return BelongsTo|Codex
     * @throws ReflectionException
     */
    public function codex(): BelongsTo
    {
        return $this->BelongsTo(Codex::class);
    }

    /**
     * @return BelongsTo|Collection|Charter[]
     * @throws ReflectionException
     */
    public function charter(): BelongsTo
    {
        return $this->BelongsTo(Charter::class);
    }

}
