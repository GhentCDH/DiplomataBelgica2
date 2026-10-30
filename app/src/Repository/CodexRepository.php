<?php


namespace App\Repository;


use App\Model\Codex;


class CodexRepository extends AbstractRepository
{
    // auto load relations
    protected $relations = [
        'copies.charter',
        'copies.charter.datations',
        'copies.charter.actors',
    ];
    protected $model = Codex::class;
}