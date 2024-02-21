<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_name_id
 * @property int actor_standardized_name_id
 * @property string name
 * @property boolean published
 * @property boolean actor_standardized_name_published
 *
 * @package App\Model
 */
class ActorName extends AbstractModel
{
    protected $localizedAttributes = [
        'name'
    ];
    protected $casts = [
        'published' => 'boolean',
        'actor_standardized_name_published' => 'boolean'
    ];
    protected $with = [
        'standardizedName'
    ];

    /**
     * @return BelongsTo|ActorStandardizedName
     * @throws ReflectionException
     */
    public function standardizedName(): BelongsTo
    {
        return $this->belongsTo(ActorStandardizedName::class);
    }
}
