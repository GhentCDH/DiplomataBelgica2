<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Relations\Concerns\AsPivot;


/**
 * @property int charter__actor_id
 * @property int charter_id
 * @property int actor_id
 * @property int published
 * @property int charter_actor_role_id
 *
 * @package App\Model
 */

class Charter_Actor extends AbstractPivot
{
    use AsPivot;

    protected $with = [
        'role'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function role(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CharterActorRole::class);
    }
}
