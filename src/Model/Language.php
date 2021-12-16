<?php

namespace App\Model;

/**
 * Class Language
 *
 * @package App\Model
 */
class Language extends IdNameMultilangModel
{
    protected $hidden = ['name_nl', 'name_en', 'name_fr'];
    protected $localizedAttributes = ['name'];
}
