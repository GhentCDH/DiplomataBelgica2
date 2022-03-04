<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int edition_indication_id
 * @property string bookpart
 * @property string nr
 * @property string pages
 * @property string comments
 * @property int published
 *
 * @package App\Model
 */
class EditionIndication extends AbstractModel
{
    protected $with = [
        'edition', 'urls'
    ];

    /**
     * @return BelongsTo|Edition
     * @throws ReflectionException
     */
    public function edition(): BelongsTo
    {
        return $this->belongsTo(Edition::class);
    }

    /**
     * @return HasMany|Collection|EditionIndicationUrl
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(EditionIndicationUrl::class);
    }
}
