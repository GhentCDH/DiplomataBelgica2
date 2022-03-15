<?php

namespace App\Model;

/**
 * @property int charter_actor_role_id
 * @property string name
 *
 * @package App\Model
 */

class CharterActorRole extends AbstractModel
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en'
    ];
    protected $localizedAttributes = [
        'name'
    ];
}
