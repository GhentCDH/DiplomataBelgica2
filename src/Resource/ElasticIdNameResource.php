<?php

namespace App\Resource;


class ElasticIdNameResource extends ElasticBaseResource
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
            $ret = parent::toArray($request);
            if ( $this->resource->name ?? null ) {
                $ret['id_name'] = $this->resource->getId().'_'.$this->resource->name;
            }
            return $ret;
        }
        return null;
    }
}