<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int edition_id
 * @property string full_title
 * @property string names_editors
 * @property int date_of_edition_year
 * @property int date_of_edition_month
 * @property int date_of_edition_day
 * @property string comments
 * @property int published
 *
 * @package App\Model
 */
class Edition extends AbstractModel
{
    protected $with = [
        'urls'
    ];

    /**
     * @return HasMany|Collection|EditionUrl
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(EditionUrl::class);
    }
}
