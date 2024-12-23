<?php


namespace App\Resource\ElasticSearch;

use App\Model\AbstractModel;
use App\Resource\Base\BaseResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ElasticBaseResource extends BaseResource
{
    public function __construct($resource)
    {
        // hide

        parent::__construct($resource);
    }

    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @property AbstractModel resource
     * @return array
     */
    public function toArray($request=null)
    {
        if (!$this->resource) {
            return [];
        }

        $ret = parent::toArray(null);

        // add id_name if resource has name property
        $ret['id_name'] = $this->when(is_string($this->resource->getAttribute('name')), $this->resource->getId().'_'.$this->resource->name);

        return $ret;
    }

    public function attributesToArray(bool $hideForeignKeys = false)
    {
        if (!$this->resource) {
            return [];
        }

        $ret = parent::toArray(null);

        // add id_name if resource has name property
        $ret['id_name'] = $this->when(is_string($this->resource->getAttribute('name')), $this->resource->getId().'_'.$this->resource->name);

        return $ret;
    }

    protected static function boolean($value)
    {
        return $value ? 'true' : null;
    }
}