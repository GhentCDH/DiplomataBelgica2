<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int secondary_literature_id
 * @property string full_title
 * @property string names_authors
 * @property int date_of_publication_year
 * @property int date_of_publication_month
 * @property int date_of_publication_day
 * @property string comments
 * @property boolean published
 *
 * @package App\Model
 */
class SecondaryLiterature extends AbstractModel
{
    protected $casts = [
        'published' => 'boolean'
    ];
    protected $with = [
        'urls'
    ];

    /**
     * @return HasMany|Collection|SecondaryLiteratureUrl
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(SecondaryLiteratureUrl::class);
    }
}
