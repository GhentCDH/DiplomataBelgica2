<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use ReflectionException;

/**
 * @property int place_id
 * @property string name
 * @property string name_regio
 * @property string latitute
 * @property string longitude
 * @property string diocese_name
 * @property string diocese_explanation
 * @property string principality_name
 * @property string principality_explanation
 * @property string url
 * @property boolean published
 * @property int place_localisation_id
 * @property boolean place_localisation_published
 *
 * @package App\Model
 */
class Place extends AbstractModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en',
        'diocese_explanation_nl', 'diocese_explanation_fr', 'diocese_explanation_en',
        'principality_explanation_nl', 'principality_explanation_fr', 'principality_explanation_en'
    ];
    protected $localizedAttributes = [
        'name',
        'diocese_explanation',
        'principality_explanation'
    ];
    protected $casts = [
        'published' => 'boolean',
        'place_localisation_published' => 'boolean'
    ];
    protected $with = [
        'localisation', 'diocese', 'principality'
    ];

    /**
     * @return BelongsTo|PlaceLocalisation
     * @throws ReflectionException
     */
    public function localisation(): BelongsTo
    {
        return $this->belongsTo(PlaceLocalisation::class);
    }

    /**
     * @return BelongsTo|Diocese
     * @throws ReflectionException
     */
    public function diocese(): BelongsTo
    {
        return $this->belongsTo(Diocese::class);
    }
    
    /**
     * @return BelongsTo|Principality
     * @throws ReflectionException
     */
    public function principality(): BelongsTo
    {
        return $this->belongsTo(Principality::class);
    }
}
