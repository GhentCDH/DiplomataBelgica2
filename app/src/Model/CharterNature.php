<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int charter_nature_id
 * @property string name
 *
 * @package App\Model
 */
class CharterNature extends LocalizedIdNameModel
{
}
