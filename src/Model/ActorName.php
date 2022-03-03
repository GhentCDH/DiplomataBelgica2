<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_name_id
 * @property int published
 * @property string full_name
 *
 * @package App\Model
 */
class ActorName extends AbstractModel
{
    protected $hidden = [
        'full_name_nl', 'full_name_fr', 'full_name_en'
    ];
    protected $localizedAttributes = [
        'full_name'
    ];

    //default relations to load
    protected $with = [
        'standardized_name'
    ];

    /**
     * @return BelongsTo|ActorStandardizedName
     * @throws ReflectionException
     */
    public function standardized_name(): BelongsTo
    {
        return $this->belongsTo(ActorStandardizedName::class);
    }
}
