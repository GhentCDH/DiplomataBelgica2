<?php


namespace App\Resource\Base;


use App\Resource\ResourceInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class BaseResource extends JsonResource implements ResourceInterface
{
    public function getId(): string
    {
        return $this->resource->getId();
    }

    public function jsonSerialize(): array
    {
        return $this->resolve();
    }

    /**
     * Resolve the resource to an array.
     *
     * @param  Request|null  $request
     * @return array
     */
    public function resolve($request = null): array
    {
        $data = $this->toArray(null);

        if ($data instanceof Arrayable) {
            $data = $data->toArray();
        } elseif ($data instanceof JsonSerializable) {
            $data = $data->jsonSerialize();
        }

        return $this->filter((array) $data);
    }

    /**
     * Create a new anonymous resource collection.
     *
     * @param  mixed  $resource
     * @return AnonymousResourceCollection
     */
    public static function collection($resource)
    {
        return tap(new BaseResourceCollection($resource, static::class), function ($collection) {
            if (property_exists(static::class, 'preserveKeys')) {
                $collection->preserveKeys = (new static([]))->preserveKeys === true;
            }
        });
    }

}