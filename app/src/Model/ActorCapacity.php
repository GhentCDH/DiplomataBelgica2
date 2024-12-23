<?php

namespace App\Model;

/**
 * @property int actor_capacity_id
 * @property string capacity
 * @property boolean published
 *
 * @package App\Model
 */
class ActorCapacity extends LocalizedIdNameModel
{
    protected $casts = [
        'published' => 'boolean'
    ];
}
