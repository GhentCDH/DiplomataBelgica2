<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int vidimus_id
 * @property int charter_id
 * @property int related_charter_id
 * @property boolean published
 *
 * @package App\Model
 */
class Vidimus extends AbstractModel
{
    protected $casts = [
        'published' => 'boolean'
    ];
}
