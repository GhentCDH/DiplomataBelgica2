<?php

namespace App\Model;

interface LocalizedIdNameInterface
{
    public function getId(): int;
    public function getName(?string $_lang): string;
}
