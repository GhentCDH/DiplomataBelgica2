<?php
namespace App\Model;

use App\Model\AbstractModel;


/**
 * Class IdNameMultilangModel
 *
 * @property string name
 * @package App\Model
 */
class LocalizedIdNameModel extends AbstractModel implements LocalizedIdNameInterface
{
    protected $localizedAttributes = [
        'name'
    ];

    public function __toString(): string
    {
        return $this->name;
    }

    public function getName(string $_lang = null): string
    {
        return $this->getLocalizedAttribute('name', $_lang);
    }
}