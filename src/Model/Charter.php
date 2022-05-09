<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionException;

/**
 * @property int charter_id
 * @property string summary
 * @property string full_text
 * @property string full_text_annotated
 * @property string full_text_stripped
 * @property boolean published
 * @property int place_id
 * @property string place_found_name
 * @property boolean place_published
 * @property boolean edition_indication_published
 * @property int charter_user_id
 * @property int charter_authenticity_id
 * @property int charter_nature_id
 * @property int charter_language_id
 * @property int charter_type_id
 *
 * @package App\Model
 */

//TODO edition_indication vs edition_indication_edition?? Also, charter.edition_indication_id vs charter__edition_indication_id?
//TODO charter_user
//TODO charter__actor.charter_actor_role -> pivot
//TODO charter__codex.published
//TODO charter__codex_url.url
//TODO charter__edition_indication.published (and .edition_id)
//TODO charter__secondary_literature_indication.published (and .secondary_literature_id)
//TODO vidimus: A > B and B > A -> correct assumption

class Charter extends AbstractModel
{
    protected $hidden = [
        'summary_nl', 'summary_fr', 'summary_en'
    ];
    protected $localizedAttributes = [
        'summary'
    ];
    protected $casts = [
        'published' => 'boolean',
        'place_published' => 'boolean',
        'edition_indication_published' => 'boolean'
    ];
    protected $with = [
        'place', 'authenticity',
        'nature', 'language', 'type', 'udt', 'actors', 'actors.pivot.role', 'codexes',
        'edition_indications', 'secondary_literature_indications',
        'copies', 'datations', 'originals', 'vidimuses'
    ];

    /**
     * @return BelongsTo|Place
     * @throws ReflectionException
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /**
     * @return BelongsTo|CharterAuthenticity
     * @throws ReflectionException
     */
    public function authenticity(): BelongsTo
    {
        return $this->belongsTo(CharterAuthenticity::class);
    }

    /**
     * @return BelongsTo|CharterNature
     * @throws ReflectionException
     */
    public function nature(): BelongsTo
    {
        return $this->belongsTo(CharterNature::class);
    }

    /**
     * @return BelongsTo|CharterType
     * @throws ReflectionException
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(CharterType::class);
    }

    /**
     * @return HasMany|CharterUdt
     * @throws ReflectionException
     */
    public function udt(): HasMany
    {
        return $this->hasMany(CharterUdt::class);
    }

    /**
     * @return BelongsToMany|CharterLanguage
     * @throws ReflectionException
     */
    public function language(): BelongsToMany
    {
        return $this->belongsToMany(CharterLanguage::class);
    }

    /**
     * @return BelongsToMany|Collection|Actor[]
     * @throws ReflectionException
     */
    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class)
            ->using(Charter_Actor::class)
            ->withPivot('charter_actor_role_id');
    }

    /**
     * @return BelongsToMany|Collection|Codex[]
     * @throws ReflectionException
     */
    public function codexes(): BelongsToMany
    {
        return $this->belongsToMany(Codex::class);
    }

    /**
     * @return BelongsToMany|Collection|EditionIndication[]
     * @throws ReflectionException
     */
    public function edition_indications(): BelongsToMany
    {
        return $this->belongsToMany(EditionIndication::class);
    }

    /**
     * @return BelongsToMany|Collection|SecondaryLiteratureIndication[]
     * @throws ReflectionException
     */
    public function secondary_literature_indications(): BelongsToMany
    {
        return $this->belongsToMany(SecondaryLiteratureIndication::class);
    }

    /**
     * @return HasMany|Collection|Copy[]
     * @throws ReflectionException
     */
    public function copies(): HasMany
    {
        return $this->hasMany(Copy::class);
    }

    /**
     * @return HasMany|Collection|Datation[]
     * @throws ReflectionException
     */
    public function datations(): HasMany
    {
        return $this->hasMany(Datation::class);
    }

    /**
     * @return HasMany|Collection|Original[]
     * @throws ReflectionException
     */
    public function originals(): HasMany
    {
        return $this->hasMany(Original::class);
    }

    /**
     * @return HasMany|Collection|Vidimus[]
     * @throws ReflectionException
     */
    public function vidimuses(): HasMany
    {
        return $this->hasMany(Vidimus::class);
    }
}
