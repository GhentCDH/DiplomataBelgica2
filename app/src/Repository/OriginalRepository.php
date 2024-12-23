<?php


namespace App\Repository;


use App\Model\Original;
use Illuminate\Database\Eloquent\Builder;


class OriginalRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [];
    protected $model = Original::class;
}