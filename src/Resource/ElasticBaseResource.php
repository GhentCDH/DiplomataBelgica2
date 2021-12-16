<?php


namespace App\Resource;

class ElasticBaseResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request=null)
    {
        $ret = ['id' => $this->getKey()];
        $ret = array_merge($ret, $this->resource->toArray());
        unset($ret[$this->getKeyName()]);

        return $ret;
    }

    public function attributesToArray()
    {
        $ret = ['id' => $this->getKey()];
        $ret = array_merge($ret, $this->resource->attributesToArray());
        unset($ret[$this->getKeyName()]);

        return $ret;
    }

    protected static function boolean($value)
    {
        return $value ? 'true' : null;
    }
}