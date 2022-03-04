<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_standardized_name_id
 * @property string actor_standardized_name
 *
 * @package App\Model
 */
class ActorStandardizedName extends AbstractModel
{
    protected $with = [
        'name_variants'
    ];

    /**
     * @return HasMany|Collection|ActorNameVariant[]
     * @throws ReflectionException
     */
    public function name_variants(): HasMany
    {
        return $this->hasMany(ActorNameVariant::class);
    }
}
