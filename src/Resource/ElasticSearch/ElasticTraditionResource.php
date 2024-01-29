<?php

namespace App\Resource\ElasticSearch;

use App\Model\Charter;
use App\Model\Codex;
use App\Model\Copy;
use App\Model\Original;

/**
 * Class ElasticCharterResource
 * @package App\Resource
 * @property Copy|Codex|Original resource
 */
class ElasticTraditionResource extends ElasticBaseResource
{
    public final function getId(): string
    {
        return $this->resource->traditionType().':'.$this->resource->getId();
    }

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request=null)
    {
        $resource = $this->resource;

        $ret = $this->attributesToArray();

        // shared relations
        $ret['urls'] = ElasticBaseResource::collection($resource->urls);
        $ret['imageUrls'] = ElasticBaseResource::collection($resource->imageUrls);
        $ret['images'] = ElasticBaseResource::collection($resource->images);

        // codex relations
        if ( $resource->isRelation('repository') ) {
            $ret['repository'] = new ElasticIdNameResource($resource->repository);
        }
        if ( $resource->isRelation('materials') ) {
            $ret['materials'] = ElasticIdNameResource::collection($this->materials);
        }
        if ( $resource->isRelation('institutions') ) {
            $ret['institutions'] = ElasticIdNameResource::collection($this->institutions);
        }
        
        $ret['type'] = $resource->traditionType();

        // if ($ret['type'] == 'manuscript') {
        //     $ret['charters'] = ElasticTraditionCharterResource::collection($this->charters);
        // }

        if ($ret['type'] == 'original' or 'copy') {
            $ret['charters'] = ElasticTraditionCharterResource::collection([$this->charter]);
        }

        if ($ret['type'] == 'manuscript') {
            $ret['charters'] = ElasticTraditionCharterResource::collection($this->charters);
        }

        $ret['has_images'] = self::boolean( (
            (count($ret['images']) > 0)
            || (count($ret['imageUrls']) > 0)
        ) ? 1 : 0 );

        $ret['image_count'] = count($ret['images']);

        return $ret;
    }

}
