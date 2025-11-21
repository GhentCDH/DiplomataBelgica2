<?php


namespace App\Service\ElasticSearch\Base;

use Elastica;
use Elastica\Index;

class Client extends Elastica\Client
{
    protected ?string $indexPrefix;

    public function __construct($config , ?string $indexPrefix = null)
    {
        $this->indexPrefix = $indexPrefix;

        if (isset($config['username']) && empty($config['username'])) {
            unset($config['username']);
        }

        if (isset($config['password']) && empty($config['password'])) {
            unset($config['password']);
        }

        parent::__construct($config);
    }

    public function getIndex(string $name): Index
    {
        return parent::getIndex(($this->indexPrefix ? $this->indexPrefix .'_' : '').$name );
    }
}
