<?php


namespace App\Repository;


use App\Model\Charter;
use Illuminate\Database\Eloquent\Builder;


class CharterRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [];
    protected $model = Charter::class;
}