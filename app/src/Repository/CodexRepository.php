<?php


namespace App\Repository;


use App\Model\Codex;


class CodexRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [
        'charters',
        'charters.datations',
        'charters.actors',
    ];
    protected $model = Codex::class;
}