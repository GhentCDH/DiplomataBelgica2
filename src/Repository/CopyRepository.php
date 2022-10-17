<?php


namespace App\Repository;


use App\Model\Copy;
use Illuminate\Database\Eloquent\Builder;


class CopyRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [];
    protected $model = Copy::class;
}