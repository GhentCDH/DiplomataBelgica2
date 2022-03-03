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
 * @property int published
 * @property string place_found_name
 *
 * @package App\Model
 */

//TODO edition_indication vs edition_indication_edition?? Also, charter.edition_indication_id vs charter__edition_indication_id?
//TODO charter_actor_role?

class Charter extends AbstractModel
{
    // append extra properties
    //protected $appends = [];

    // hide properties in toArray conversion
    protected $hidden = [
        'summary_nl', 'summary_fr', 'summary_en'
    ];

    // translatable attributes
    protected $localizedAttributes = [
        'summary',
    ];

    // autoload relations
    protected $with = [
        'place', 'edition_indication', 'edition', 'authenticity', 'nature', 'language', 'type', 'udt', 'actors', 'codexes', 'edition_indications', 'secondary_literature_indications'
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
     * @return BelongsTo|EditionIndication
     * @throws ReflectionException
     */
    public function edition_indication(): BelongsTo
    {
        return $this->belongsTo(EditionIndication::class);
    }

    /**
     * @return BelongsTo|Edition
     * @throws ReflectionException
     */
    public function edition(): BelongsTo
    {
        return $this->belongsTo(Edition::class);
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
     * @return BelongsTo|CharterLanguage
     * @throws ReflectionException
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(CharterLanguage::class);
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
     * @return HasOne|CharterUdt
     * @throws ReflectionException
     */
    public function udt(): HasOne
    {
        return $this->hasOne(CharterUdt::class);
    }

    /**
     * @return BelongsToMany|Collection|Actor[]
     * @throws ReflectionException
     */
    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class);
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
}
