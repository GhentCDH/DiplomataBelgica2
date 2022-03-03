<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int secondary_literature_indication_id
 * @property string bookpart
 * @property string nr
 * @property string pages
 * @property string comments
 * @property int published
 *
 * @package App\Model
 */
class SecondaryLiteratureIndication extends AbstractModel
{
    protected $with = [
        'secondary_literature'
    ];

    /**
     * @return BelongsTo|SecondaryLiterature
     * @throws ReflectionException
     */
    public function secondary_literature(): BelongsTo
    {
        return $this->belongsTo(SecondaryLiterature::class);
    }
}
