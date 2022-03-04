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
 * @property int published
 * @property string codex_pof
 * @property string codex_sequence_number
 * @property string repository_reference_number
 *
 * @package App\Model
 */

class Original extends AbstractModel
{
    // autoload relations
    protected $with = [
        'codex', 'repository', 'images', 'external_image_urls', 'urls'
    ];

    /**
     * @return BelongsTo|Codex
     * @throws ReflectionException
     */
    public function codex(): BelongsTo
    {
        return $this->belongsTo(Codex::class);
    }

    /**
     * @return BelongsTo|Repository
     * @throws ReflectionException
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * @return HasMany|Collection|Image[]
     * @throws ReflectionException
     */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    /**
     * @return HasMany|Collection|OriginalExternalImageUrl[]
     * @throws ReflectionException
     */
    public function external_image_urls(): HasMany
    {
        return $this->hasMany(OriginalExternalImageUrl::class);
    }

    /**
     * @return HasMany|Collection|OriginalUrl[]
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(OriginalUrl::class);
    }
}
