<?php
namespace App\Model;


use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionClass;
use ReflectionException;
use function Symfony\Component\String\u;

abstract class AbstractTraditionModel extends AbstractModel implements TraditionModelInterface
{
    /**
     * @return BelongsTo|Repository
     * @throws ReflectionException
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * @return HasMany|Collection|Image[]
     * @throws ReflectionException
     */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    /**
     * @return HasMany|Collection|CodexExternalImageUrl[]
     * @throws ReflectionException
     */
    public function imageUrls(): HasMany
    {
        return $this->hasMany(static::class . 'ExternalImageUrl');
    }

    /**
     * @return HasMany|Collection|CodexUrl[]
     * @throws ReflectionException
     */
    public function urls(): HasMany
    {
        return $this->hasMany(static::class . 'Url');
    }
}