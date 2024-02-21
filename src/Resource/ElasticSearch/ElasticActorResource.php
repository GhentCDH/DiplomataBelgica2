<?php

namespace App\Resource\ElasticSearch;

use App\Model\Actor;

/**
 * @property Actor $resource
 */
class ElasticActorResource extends ElasticBaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request=null)
    {
        $actor = $this->resource;

        $ret = $this->attributesToArray();
        $ret['name'] = new ElasticBaseResource($actor->name);
        $ret['capacity'] = new ElasticBaseResource($actor->capacity);
        $ret['order'] = new ElasticBaseResource($actor->order);
        $ret['place_institute'] = new ElasticBaseResource($actor->place_institute);
        $ret['place'] = new ElasticPlaceResource($actor->place);
        $ret['role'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
            return new ElasticBaseResource($actor->pivot->role);
        });

        return $ret;
    }
}