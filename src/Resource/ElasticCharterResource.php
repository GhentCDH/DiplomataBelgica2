<?php

namespace App\Resource;

use App\Model\Charter;

/**
 * Class ElasticCharterResource
 * @package App\Resource
 * @mixin Charter
 */
class ElasticCharterResource extends ElasticBaseResource
{
    const CACHENAME = "charter_elastic";

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request=null)
    {
        /** @var Charter $charter */
        $charter = $this->resource;

        $ret = $this->attributesToArray();
        $ret['languages'] = ElasticIdNameResource::collection($charter->languages);
        $ret['place'] = new ElasticBaseResource($charter->place);
        $ret['actors'] = ElasticBaseResource::collection($charter->actors);

        return $ret;
    }

}