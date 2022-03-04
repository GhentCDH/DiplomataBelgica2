<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int datation_id
 * @property string researcher
 * @property int preference
 * @property boolean published
 * @property int charter_id
 * @property boolean charter_published
 *
 * @package App\Model
 */

class Datation extends AbstractModel
{
    protected $casts = [
        'published' => 'boolean',
        'charter_published' => 'boolean'
    ];
    protected $with = [
        'time'
    ];

    /**
     * @return HasOne|DatationTime
     * @throws ReflectionException
     */
    public function time(): hasOne
    {
        return $this->hasOne(DatationTime::class);
    }
}
