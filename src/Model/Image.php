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
 * @property int published
 * @property int original_sequence_number
 * @property int original_published
 * @property int copy_id
 * @property int copy_published
 * @property int codex_id
 * @property int codex_sequence_number
 * @property int codex_published
 *
 * @package App\Model
 */
class Image extends AbstractModel
{
    // hide properties in toArray conversion
    protected $hidden = [
        'description_nl', 'description_fr', 'description_en'
    ];

    // translatable attributes
    protected $localizedAttributes = [
        'description'
    ];
}
