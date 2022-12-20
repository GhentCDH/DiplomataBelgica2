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
        $ret['type'] = new ElasticBaseResource($charter->type);
        $ret['udt'] = ElasticBaseResource::collection($charter->udt);
        $ret['language'] = ElasticIdNameResource::collection($charter->language);
        $ret['actors'] = ElasticActorResource::collection($charter->actors);
        $ret['codexes'] = ElasticBaseResource::collection($charter->codexes);
        $ret['edition_indications'] = ElasticBaseResource::collection($charter->edition_indications);
        $ret['secondary_literature_indications'] = ElasticBaseResource::collection($charter->secondary_literature_indications);
        $ret['copies'] = ElasticBaseResource::collection($charter->copies);
        $ret['datations'] = ElasticBaseResource::collection($charter->datations);
        $ret['originals'] = ElasticBaseResource::collection($charter->originals);
        $ret['vidimuses'] = ElasticBaseResource::collection($charter->vidimuses);
        $ret['images'] = [];
        $ret['imageUrls'] = [];
        
        foreach ($ret['originals'] as $value) {
            if (count($value['images']) > 0 ) {
                $ret['images'] = $value['images'];
            }
            if (count($value['imageUrls']) > 0 ) {
                $ret['imageUrls'] = $value['imageUrls'];
            }
        }
        foreach ($ret['codexes'] as $value) {
            if (count($value['images']) > 0 ) {
                $ret['images'] = $value['images'];
            }
            if (count($value['imageUrls']) > 0 ) {
                $ret['imageUrls'] = $value['imageUrls'];
            }
        }
        foreach ($ret['copies'] as $value) {
            if (count($value['images']) > 0 ) {
                $ret['images'] = $value['images'];
            }
            if (count($value['imageUrls']) > 0 ) {
                $ret['imageUrls'] = $value['imageUrls'];
            }
        }

        $ret['has_images'] = self::boolean( (
            (count($ret['images']) > 0)
            || (count($ret['imageUrls']) > 0)
        ) ? 1 : 0 );

        $ret['image_count'] = count($ret['images']);

        return $ret;
    }

}
