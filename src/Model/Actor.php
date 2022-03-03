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
 *
 * @package App\Model
 */
class Actor extends AbstractModel
{
    //default relations to load
    protected $with = [
        'capacity', 'name', 'place', 'order', 'place_institute'
    ];

    /**
     * @return BelongsTo|ActorCapacity
     * @throws ReflectionException
     */
    public function capacity(): BelongsTo
    {
        return $this->belongsTo(ActorCapacity::class);
    }

    /**
     * @return BelongsTo|ActorName
     * @throws ReflectionException
     */
    public function name(): BelongsTo
    {
        return $this->belongsTo(ActorName::class);
    }

    /**
     * @return BelongsTo|Place
     * @throws ReflectionException
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /**
     * @return BelongsTo|ActorOrder
     * @throws ReflectionException
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(ActorOrder::class);
    }

    /**
     * @return BelongsTo|ActorPlaceInstitute
     * @throws ReflectionException
     */
    public function place_institute(): BelongsTo
    {
        return $this->belongsTo(ActorPlaceInstitute::class);
    }
}
