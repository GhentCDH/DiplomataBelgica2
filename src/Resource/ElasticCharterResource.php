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
        $ret['place'] = new ElasticBaseResource($charter->place);
        $ret['edition_indication'] = new ElasticBaseResource($charter->edition_indication);
        $ret['edition'] = new ElasticBaseResource($charter->edition);
        $ret['authenticity'] = new ElasticBaseResource($charter->authenticity);
        $ret['nature'] = new ElasticBaseResource($charter->nature);
        $ret['languages'] = ElasticIdNameResource::collection($charter->languages);
        $ret['actors'] = ElasticBaseResource::collection($charter->actors);

        return $ret;
    }

}