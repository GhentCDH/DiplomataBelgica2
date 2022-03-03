<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int codex_id
 * @property string stein_number
 * @property string title
 * @property string redaction_date
 * @property string pages
 * @property int published
 * @property int repository_reference_number
 * @property string name_author
 *
 * @package App\Model
 */

class Codex extends AbstractModel
{
    // append extra properties
    //protected $appends = [];

    // hide properties in toArray conversion
    protected $hidden = [
        'title_nl', 'title_fr', 'title_en',
        'redaction_date_nl', 'redaction_date_fr', 'redaction_date_en'
    ];

    // translatable attributes
    protected $localizedAttributes = [
        'title',
        'redaction_date'
    ];

    // autoload relations
    protected $with = [
        'repository', 'external_image_urls', 'interested_institutions', 'materials', 'urls'
    ];

    /**
     * @return BelongsTo|Repository
     * @throws ReflectionException
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * @return HasMany|Collection|CodexExternalImageUrl[]
     * @throws ReflectionException
     */
    public function external_image_urls(): HasMany
    {
        return $this->hasMany(CodexExternalImageUrl::class);
    }

    /**
     * @return BelongsToMany|Collection|CodexInstitution[]
     * @throws ReflectionException
     */
    public function interested_institutions(): BelongsToMany
    {
        return $this->belongsToMany(CodexInstitution::class);
    }

    /**
     * @return BelongsToMany|Collection|CodexMaterial[]
     * @throws ReflectionException
     */
    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(CodexMaterial::class);
    }

    /**
     * @return HasMany|Collection|CodexNameAuthor[]
     * @throws ReflectionException
     */
    public function author_names(): HasMany
    {
        return $this->hasMany(CodexNameAuthor::class);
    }

    /**
     * @return HasMany|Collection|CodexUrl[]
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(CodexUrl::class);
    }
}
