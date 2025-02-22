<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int original_url_id
 * @property int original_id
 * @property string url
 *
 * @package App\Model
 */
class OriginalUrl extends AbstractModel
{
}
