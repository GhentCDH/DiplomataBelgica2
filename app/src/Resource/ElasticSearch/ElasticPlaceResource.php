<?php

namespace App\Resource\ElasticSearch;

use App\Model\Place;
use Illuminate\Http\Request;

/**
 * @property Place $resource
 */
class ElasticPlaceResource extends ElasticBaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request=null)
    {
        if (!$this->resource) {
            return [];
        }

        $place = $this->resource;

        $ret = $this->attributesToArray(true);

        $ret['diocese'] = new ElasticBaseResource($place->diocese);
        $ret['principality'] = new ElasticBaseResource($place->principality);
        $ret['place_localisation'] = new ElasticBaseResource($place->placeLocalisation);

        return $ret;
    }
}