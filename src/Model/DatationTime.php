<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use ReflectionException;

/**
 * @property int datation_time_id
 * @property int year
 * @property int month
 * @property int day
 * @property string interpretation
 * @property int published
 * @property string comments
 *
 * @package App\Model
 */

class DatationTime extends AbstractModel
{
    // hide properties in toArray conversion
    protected $hidden = [
        'datation_comments_nl', 'datation_comments_fr', 'datation_comments_en'
    ];

    // translatable attributes
    protected $localizedAttributes = [
        'datation_comments'
    ];

    // autoload relations
    protected $with = [
        'originality'
    ];

    /**
     * @return BelongsTo|DatationTimeOriginality
     * @throws ReflectionException
     */
    public function originality(): BelongsTo
    {
        return $this->belongsTo(DatationTimeOriginality::class);
    }
}
