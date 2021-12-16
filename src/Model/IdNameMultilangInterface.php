<?php

namespace App\Model;

interface IdNameMultilangInterface
{
    public function getId(): int;
    public function getName(?string $_lang): string;
}
