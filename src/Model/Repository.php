<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int repository_id
 * @property string name
 * @property string location
 * @property string class
 * @property int published
 *
 * @package App\Model
 */

class Repository extends AbstractModel
{
    // append extra properties
    //protected $appends = [];

    // hide properties in toArray conversion
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en',
        'location_nl', 'location_fr', 'location_en',
        'class_nl', 'class_fr', 'class_en'
    ];

    // translatable attributes
    protected $localizedAttributes = [
        'name',
        'location',
        'class'
    ];
}
