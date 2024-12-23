<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int image_id
 * @property string image_file
 * @property string description
 * @property boolean published
 * @property int original_id
 * @property int original_sequence_number
 * @property boolean original_published
 * @property int copy_id
 * @property int copy_sequence_number
 * @property boolean copy_published
 * @property int codex_id
 * @property int codex_sequence_number
 * @property boolean codex_published
 *
 * @package App\Model
 */
class Image extends AbstractModel
{
    protected $hidden = [
        'description_nl', 'description_fr', 'description_en'
    ];
    protected $localizedAttributes = [
        'description'
    ];
    protected $casts = [
        'published' => 'boolean',
        'original_published' => 'boolean',
        'copy_published' => 'boolean',
        'codex_published' => 'boolean'
    ];
}
