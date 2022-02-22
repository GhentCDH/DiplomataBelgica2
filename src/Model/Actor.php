<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_id
 * @property int published
 * @property string order
 *
 * @package App\Model
 */
class Actor extends AbstractModel
{
    protected $hidden = ['order_nl', 'order_fr', 'order_en'];
    protected $localizedAttributes = ['order'];
    protected $with = ['place', 'name']; //default relations to load

    /**
     * @return BelongsTo|Collection|Place
     * @throws ReflectionException
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'actor_place_id');
    }

    /**
     * @return BelongsTo|Collection|Name
     * @throws ReflectionException
     */
    public function name(): BelongsTo
    {
        return $this->belongsTo(Name::class, 'actor_name_id');
    }

}
