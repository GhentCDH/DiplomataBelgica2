<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_capacity_id
 * @property int published
 *
 * @package App\Model
 */
class ActorCapacity extends AbstractModel
{
    protected $hidden = [
        'capacity_nl', 'capacity_fr', 'capacity_en'
    ];
    protected $localizedAttributes = [
        'capacity'
    ];
}
