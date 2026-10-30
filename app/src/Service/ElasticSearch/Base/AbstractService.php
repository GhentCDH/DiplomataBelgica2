<?php

namespace App\Service\ElasticSearch\Base;

use Elastica\Index;
use Exception;
use Symfony\Contracts\Translation\LocaleAwareInterface;

/**
 * Each service works on the index of one locale: {prefix}_{indexName}_{locale}.
 * Symfony sets the request locale on every request (kernel.locale_aware).
 */
abstract class AbstractService implements LocaleAwareInterface
{
    public const DEFAULT_LOCALE = 'en';

    protected Client $client;
    protected ?Index $index = null;

    protected bool $debug = false;


    protected string $indexPrefix;

    protected string $locale = self::DEFAULT_LOCALE;
    protected array $indexLocales;

    public function __construct(
        Client $client,
        string $indexPrefix,
        bool $debug = false,
        array $indexLocales = [self::DEFAULT_LOCALE]
    ) {
        $this->client = $client;
        $this->indexPrefix = $indexPrefix;
        $this->debug = $debug;
        $this->indexLocales = $indexLocales;

        if (!defined('static::indexName')) {
            throw new Exception('Constant indexName is not defined on subclass ' . get_class($this));
        }
    }

    protected function getClient(): Client
    {
        return $this->client;
    }

    protected function getIndex(): Index
    {
        if ( !$this->index ) {
            $this->index = $this->client->getIndex($this->getIndexName());
        }

        return $this->index;
    }

    public function removeIndex(string $indexName): void
    {
        $this->client->getIndex($indexName)->delete();
    }

    protected function getIndexName(): string
    {
        return $this->indexPrefix.'_'.static::indexName.'_'.$this->locale;
    }

    /**
     * Switch to the index of the given locale (the default locale if there is no index for it)
     */
    public function setLocale(string $locale): void
    {
        $locale = in_array($locale, $this->indexLocales, true) ? $locale : self::DEFAULT_LOCALE;
        if ($locale !== $this->locale) {
            $this->locale = $locale;
            $this->index = null;
        }
    }

    public function getLocale(): string
    {
        return $this->locale;
    }

    public function getIndexLocales(): array
    {
        return $this->indexLocales;
    }

    /**
     * Copy of this service that works on the index of the given locale
     */
    public function forLocale(string $locale): static
    {
        $service = clone $this;
        $service->index = null;
        $service->setLocale($locale);

        return $service;
    }
}