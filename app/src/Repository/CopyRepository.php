<?php


namespace App\Repository;


use App\Model\Copy;
use Illuminate\Database\Eloquent\Builder;


class CopyRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [
        'charter',
        'charter.datations',
        'charter.actors',
    ];
    protected $model = Copy::class;
}