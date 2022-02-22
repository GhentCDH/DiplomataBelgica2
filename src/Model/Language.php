<?php

namespace App\Model;

/**
 * Class Language
 *
 * @property int language_id
 * @property string name
 * @package App\Model
 */
class Language extends IdNameMultilangModel
{
    protected $hidden = ['name_nl', 'name_fr', 'name_en'];
    protected $localizedAttributes = ['name'];
}
