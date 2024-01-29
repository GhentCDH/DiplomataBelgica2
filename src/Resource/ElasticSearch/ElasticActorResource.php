<?php

namespace App\Resource\ElasticSearch;

use App\Model\Actor;

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
        /** @var Actor $charter */
        $actor = $this->resource;

        $ret = parent::toArray();
        // $ret['actor_diocese'] = [];
        // $ret['actor_order'] = [];
        $ret['capacity'] = new ElasticIdNameResource($actor->capacity);
        $ret['role'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
            return new ElasticIdNameResource($actor->pivot->role);
        });

        return $ret;
    }
}