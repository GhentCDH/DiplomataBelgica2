<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int charter_id
 * @property string full_text
 * @property string full_text_annotated
 * @property string full_text_stripped
 * @property string summary
 * @property string authenticity
 * @property int published
 *
 * @package App\Model
 */

class Charter extends AbstractModel
{
    // append extra properties
    //protected $appends = [];

    // hide properties in toArray conversion
    protected $hidden = [
        'summary_nl', 'summary_fr', 'summary_en',
        'authenticity_nl', 'authenticity_fr', 'authenticity_en',
        'nature_nl', 'nature_fr', 'nature_en',
    ];

    protected $localizedAttributes = ['summary', 'nature', 'authenticity']; // translatable attributes

    // autoload relations
    protected $with = [
        'languages', 'place', 'actors'
    ];

    /**
     * @return BelongsToMany|Collection|Language[]
     * @throws ReflectionException
     */
    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'charter_language');
    }

    /**
     * @return BelongsTo|Place
     * @throws ReflectionException
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'charter_place_id', 'place_id');
    }

    /**
     * @return BelongsToMany|Collection|Actor[]
     * @throws ReflectionException
     */
    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class, 'charter_actor');
    }

}
