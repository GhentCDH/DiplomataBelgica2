<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use ReflectionException;

/**
 * @property int place_localisation_id
 * @property string echelon_1
 * @property string echelon_2
 * @property string echelon_3
 * @property string echelon_4
 * @property string echelon_5
 * @property boolean published
 * @property int place_localisation_land_id
 *
 * @package App\Model
 */
class PlaceLocalisation extends AbstractModel
{
    protected $hidden = [
        'echelon_1_nl', 'echelon_1_fr', 'echelon_1_en',
        'echelon_2_nl', 'echelon_2_fr', 'echelon_2_en',
        'echelon_3_nl', 'echelon_3_fr', 'echelon_3_en',
        'echelon_4_nl', 'echelon_4_fr', 'echelon_4_en',
        'echelon_5_nl', 'echelon_5_fr', 'echelon_5_en'
    ];
    protected $localizedAttributes = [
        'echelon_1',
        'echelon_2',
        'echelon_3',
        'echelon_4',
        'echelon_5'
    ];
    protected $casts = [
        'published' => 'boolean'
    ];
    protected $with = [
        'land'
    ];

    /**
     * @return BelongsTo|PlaceLocalisationLand
     * @throws ReflectionException
     */
    public function land(): BelongsTo
    {
        return $this->belongsTo(PlaceLocalisationLand::class);
    }
}
