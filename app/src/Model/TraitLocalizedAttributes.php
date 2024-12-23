<?php
namespace App\Model;

trait TraitLocalizedAttributes {

    protected $localizedAttributes = [];

    protected static $defaultLocale = 'en';
    protected static $locale = null;
    protected static $locales = ['nl','fr','en'];

    public function initLocalizedAttributes(): void
    {
        foreach ($this->localizedAttributes as $attr) {
            $attributes[$attr] = $this->getLocalizedAttribute($attr);
            foreach(self::$locales as $locale) {
                $this->makeHidden($attr . "_" . $locale);
                // hack to add localized attributes
                // would be better to override attributesToArray() in derived class
                $this->append($attr);
            }
        }
    }

    /**
     * Set attribute translation (for all models!)
     */
    public function translate(string $locale) {
        static::$locale = $locale;

        return $this;
    }

    /**
     * Check if attributed is localized
     * @param string $key
     * @return bool
     */
    public function isLocalizedAttribute(string $key): bool
    {
        return in_array($key, $this->localizedAttributes, true);
    }

    /**
     * Add translation support to eloquent getAttribute
     */
    public function getAttribute($attr)
    {
        if ( !$this->isLocalizedAttribute($attr) ) {
            return parent::getAttribute($attr);
        }

        return $this->getLocalizedAttribute($attr, static::$locale);
    }

    // override attribute mutator, prevent localizedAttributes from being mutated
    protected function mutateAttribute($key, $value)
    {
        // don't mutate localized attributes

        if ( !$this->isLocalizedAttribute($key) ) {
            parent::mutateAttribute($key, $value);
        }
        return $this->getLocalizedAttribute($key);
    }

    /**
     * Get property value based on locale
     *
     * @param string $attr
     * @param string|null $locale
     * @return mixed
     */
    protected function getLocalizedAttribute(string $attr, string $locale = null)
    {
        $locale = $locale ?? static::$locale;
        $locale = in_array($locale, static::$locales, true ) ? $locale : static::$defaultLocale;
        $attr .= "_" . $locale;

        return $this->getAttributeValue($attr);
    }

}