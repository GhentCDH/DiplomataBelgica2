<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int charter_udt_id
 * @property int charter_id
 * @property string type
 * @property int date_year
 * @property int date_month
 * @property int date_day
 *
 * @package App\Model
 */
class CharterUdt extends AbstractModel
{
}
