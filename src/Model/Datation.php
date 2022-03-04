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
 * @property int published
 *
 * @package App\Model
 */

class Datation extends AbstractModel
{
    // autoload relations
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
