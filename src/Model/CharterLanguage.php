<?php

namespace App\Model;

/**
 * @property int charter_language_id
 * @property string name
 *
 * @package App\Model
 */
class CharterLanguage extends IdNameMultilangModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en'
    ];
    protected $localizedAttributes = [
        'name'
    ];
}
