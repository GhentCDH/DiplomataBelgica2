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
        /*
         *         <FormatValue :value="actor.capacity" type="id_name" :unknown="false" />
        <FormatValue :value="actor.place" type="id_name" :unknown="false" />
        <FormatValue :value="actor.name.name" :unknown="false" />
         */
        $ret['label'] = implode(' - ', array_filter([
            $actor?->capacity?->name ?? null,
            $actor?->place?->name ?? null,
            $actor?->name?->name ?? null,
        ]));
        $ret['name'] = new ElasticBaseResource($actor->name);
        $ret['capacity'] = new ElasticBaseResource($actor->capacity);
        $ret['order'] = new ElasticBaseResource($actor->order);
        $ret['place_institute'] = new ElasticBaseResource($actor->place_institute);
        $ret['place'] = new ElasticPlaceResource($actor->place);
        $ret['role'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
            return new ElasticBaseResource($actor->pivot->role);
        });
        $ret['charter__actor_id'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
            return $actor->pivot->charter__actor_id;
        });

        return $ret;
    }
}