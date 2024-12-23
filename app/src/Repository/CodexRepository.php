<?php


namespace App\Repository;


use App\Model\Codex;


class CodexRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [];
    protected $model = Codex::class;
}