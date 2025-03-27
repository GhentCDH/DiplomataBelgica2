<?php


namespace App\Repository;


use App\Model\Charter;
use Illuminate\Database\Eloquent\Builder;


class CharterRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [
        'place', 'place.diocese', 'place.principality',
        'edition_indication', 'edition', 'authenticity',
        'nature', 'language', 'type', 'udt', 'actors', 'actors.pivot.role', 'codexes',
        'edition_indications', 'secondary_literature_indications',
        'copies',
        'originals', 'vidimuses',
        'datations', 'datations.time'
    ];
    protected $model = Charter::class;
}