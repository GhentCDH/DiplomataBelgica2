<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int name_id
 * @property int published
 * @property int full_name
 *
 * @package App\Model
 */
class Name extends AbstractModel
{
    protected $hidden = ['full_name_nl', 'full_name_fr', 'full_name_en'];
    protected $localizedAttributes = ['full_name'];

}
