<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int secondary_literature_indication_id
 * @property string bookpart
 * @property string nr
 * @property string pages
 * @property string comments
 * @property boolean published
 * @property int secondary_literature_id
 * @property boolean secondary_literature_published
 *
 * @package App\Model
 */
class SecondaryLiteratureIndication extends AbstractModel
{
    protected $casts = [
        'published' => 'boolean',
        'secondary_literature_published' => 'boolean'
    ];
    protected $with = [
        'secondary_literature', 'urls'
    ];

    /**
     * @return BelongsTo|SecondaryLiterature
     * @throws ReflectionException
     */
    public function secondary_literature(): BelongsTo
    {
        return $this->belongsTo(SecondaryLiterature::class);
    }

    /**
     * @return HasMany|Collection|SecondaryLiteratureIndicationUrl[]
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(SecondaryLiteratureIndicationUrl::class);
    }
}
