<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;
use AjCastro\EagerLoadPivotRelations\EagerLoadPivotTrait;

/**
 * @property int actor_id
 * @property boolean published
 * @property int actor_capacity_id
 * @property boolean actor_capacity_published
 * @property int actor_name_id
 * @property boolean actor_name_published
 * @property int place_id
 * @property boolean place_published
 * @property int actor_order_id
 * @property int actor_place_institute_id
 *
 * @package App\Model
 */
class Actor extends AbstractModel
{
    use EagerLoadPivotTrait;

    protected $casts = [
        'published' => 'boolean',
        'actor_capacity_published' => 'boolean',
        'actor_name_published' => 'boolean',
        'place_published' => 'boolean'
    ];
    protected $with = [
        'capacity', 'name', 'place', 'order', 'placeInstitute'
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
    public function placeInstitute(): BelongsTo
    {
        return $this->belongsTo(ActorPlaceInstitute::class);
    }
}
