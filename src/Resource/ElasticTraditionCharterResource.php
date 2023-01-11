<?php

namespace App\Resource;
use App\Model\Actor;

class ElasticTraditionCharterResource extends ElasticBaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request = null): ?array
    {
        if ($this->resource) {
            $actor = $this->resource->actors;
            $ret['id'] = $this->resource->getId();
            $ret['datations'] = $this->resource->datations;
            $ret['actors'] = ElasticActorResource::collection ($actor);

            return $ret;
        }
        return null;
    }
}