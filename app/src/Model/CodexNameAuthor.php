<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int codex_name_author_id
 * @property int codex_id
 * @property string name
 *
 * @package App\Model
 */
class CodexNameAuthor extends AbstractModel
{
}
