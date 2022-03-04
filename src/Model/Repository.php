<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int repository_id
 * @property string name
 * @property string location
 * @property string class
 * @property boolean published
 *
 * @package App\Model
 */

class Repository extends AbstractModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en',
        'location_nl', 'location_fr', 'location_en',
        'class_nl', 'class_fr', 'class_en'
    ];
    protected $localizedAttributes = [
        'name',
        'location',
        'class'
    ];
    protected $casts = [
        'published' => 'boolean'
    ];
    protected $with = [
        'urls'
    ];

    /**
     * @return HasMany|Collection|RepositoryUrl[]
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(RepositoryUrl::class);
    }
}
