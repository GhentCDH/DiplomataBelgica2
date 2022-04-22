<?php
namespace App\Model;

use App\Model\AbstractModel;


/**
 * Class IdNameMultilangModel
 *
 * @property string name
 * @package App\Model
 */
class IdNameMultilangModel extends AbstractModel implements IdNameMultilangInterface
{
    protected $hidden = [
        'name_nl', 'name_fr', 'name_en'
    ];
    protected $localizedAttributes = [
        'name'
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
    }

    public function __toString(): string
    {
        return $this->name;
    }

    public function getName(string $_lang = null): string
    {
        return $this->getLocalizedAttribute('name', $_lang);
    }
}