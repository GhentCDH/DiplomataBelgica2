<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int actor_name_variant_id
 * @property int actor_standardized_name_id
 * @property string variant
 *
 * @package App\Model
 */
class ActorNameVariant extends AbstractModel
{
}
