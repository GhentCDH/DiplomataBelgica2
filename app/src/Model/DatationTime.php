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
 * @property boolean published
 * @property int datation_id
 * @property string datation_comments
 * @property boolean datation_published
 * @property int datation_time_originality_id
 *
 * @package App\Model
 */

class DatationTime extends AbstractModel
{
    protected $hidden = [
        'datation_comments_nl', 'datation_comments_fr', 'datation_comments_en'
    ];
    protected $localizedAttributes = [
        'datation_comments'
    ];
    protected $casts = [
        'published' => 'boolean',
        'datation_published' => 'boolean'
    ];
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
