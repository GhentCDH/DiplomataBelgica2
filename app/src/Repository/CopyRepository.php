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

    // copies inside a manuscript are listed on the manuscript page; only loose copies
    // ("copie séparée") are tradition records of their own
    public function defaultQuery(): Builder
    {
        return parent::defaultQuery()->where('loose', 1);
    }
}