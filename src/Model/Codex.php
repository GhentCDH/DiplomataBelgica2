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
 * @property boolean published
 * @property int repository_id
 * @property string repository_reference_number
 * @property boolean repository_published
 * @property string name_author
 *
 * @package App\Model
 */

class Codex extends AbstractTraditionModel
{
    protected $hidden = [
        'title_nl', 'title_fr', 'title_en',
        'redaction_date_nl', 'redaction_date_fr', 'redaction_date_en'
    ];
    protected $localizedAttributes = [
        'title',
        'redaction_date'
    ];
    protected $casts = [
        'published' => 'boolean',
        'repository_published' => 'boolean'
    ];
    protected $with = [
        'repository', 'imageUrls', 'urls', 'images', 'institutions', 'materials',  'authorNames'
    ];

    public function traditionType(): string
    {
        return 'manuscript';
    }

    /**
     * @return BelongsToMany|Collection|CodexInstitution[]
     * @throws ReflectionException
     */
    public function institutions(): BelongsToMany
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
    public function authorNames(): HasMany
    {
        return $this->hasMany(CodexNameAuthor::class);
    }

    /**
     * @return BelongsToMany|Collection|Charter[]
     * @throws ReflectionException
     */
    public function charters(): BelongsToMany
    {
        return $this->BelongsToMany(Charter::class, 'charter__codex');
    }

}
