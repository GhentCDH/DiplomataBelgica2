<?php

namespace App\Model;

/**
 * Class Language
 *
 * @package App\Model
 * @property int place_id
 * @property string name
 */
class Place extends AbstractModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en',
        'diocese_name_nl', 'diocese_name_fr', 'diocese_name_en',
        'principality_name_nl', 'principality_name_fr', 'principality_name_en',
    ];
    protected $localizedAttributes = ['name', 'diocese_name', 'principality_name'];

}
