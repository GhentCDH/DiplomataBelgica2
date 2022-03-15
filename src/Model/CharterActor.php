<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Relations\Concerns\AsPivot;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;
use ReflectionException;

/**
 * @property int charter__actor_id
 * @property int charter_id
 * @property int actor_id
 * @property int published
 * @property int charter_actor_role_id
 *
 * @package App\Model
 */

class CharterActor extends Pivot
{
    use AsPivot;

    protected $with = [
        'role'
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = 'charter__actor';
        $this->primaryKey = $this->table . '_id';
    }

    /**
     * @return HasOne|CharterActorRole
     * @throws ReflectionException
     */
    public function role(): HasOne
    {
        return $this->hasOne(CharterActorRole::class);
    }
}
