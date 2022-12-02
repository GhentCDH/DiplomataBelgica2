<?php

namespace App\Resource;
use App\Model\Actor;

class ElasticTraditionCharterResource extends ElasticBaseResource
// {
//     /**
//      * Transform the resource into an array.
//      *
//      * @param  \Illuminate\Http\Request  $request
//      * @return array
//      */
//     public function toArray($request=null)
//     {
//         /** @var Actor $charter */
//         $actor = $this->resource;

//         $ret = parent::toArray();
//         $ret['id'] = $this->getId()
//         $ret['udt'] = $this-udt
//         $ret['capacity'] = new ElasticIdNameResource($actor->capacity);
//         $ret['role'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
//             return new ElasticIdNameResource($actor->pivot->role);
//         });

//         return $ret;
//     }
// }

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
            $actor = $this->resource;
            // $ret = parent::toArray($request);

            // $ret['id'] = $this->resource->getId();
            $ret['udt'] = $this->resource->udt;
            $ret['capacity'] = new ElasticIdNameResource($this->resource->capacity);
            $ret['role'] = $this->whenPivotLoaded('charter__actor', function() use ($actor) {
                return new ElasticIdNameResource($this->resource->pivot->role);
            });
            return $ret;
        }
        return null;
    }
}