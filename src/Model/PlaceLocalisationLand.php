<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int place_localisation_land_id
 * @property string name
 *
 * @package App\Model
 */
class PlaceLocalisationLand extends AbstractModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en'
    ];
    protected $localizedAttributes = [
        'name'
    ];
}
