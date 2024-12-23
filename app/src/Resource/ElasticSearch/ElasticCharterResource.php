<?php

namespace App\Resource\ElasticSearch;

use App\Model\Charter;
use App\Resource\ResourceInterface;
use Illuminate\Http\Request;

/**
 * Class ElasticCharterResource
 * @package App\Resource
 * @mixin Charter
 */
class ElasticCharterResource extends ElasticBaseResource implements ResourceInterface
{
    public function toArray($request = null): array
    {
        /** @var Charter $charter */
        $charter = $this->resource;

        $ret = $this->attributesToArray(true);

        $ret['place'] = (new ElasticPlaceResource($charter->place))->toArray();
        $ret['edition_indication'] = new ElasticBaseResource($charter->edition_indication);
        $ret['edition'] = new ElasticBaseResource($charter->edition);
        $ret['authenticity'] = new ElasticBaseResource($charter->authenticity);
        $ret['nature'] = new ElasticBaseResource($charter->nature);
        $ret['type'] = new ElasticBaseResource($charter->type);
        $ret['udt'] = ElasticBaseResource::collection($charter->udt);
        $ret['language'] = ElasticBaseResource::collection($charter->language);
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
        $ret['date'] = [];
        $ret['actor_name'] = [];
        $ret['actor_capacity'] = [];
        $ret['actor_place'] = [];
        $ret['actor_diocese'] = [];
        $ret['actor_principality'] = [];
        $ret['actor_order'] = [];

        ##### flatten required fields for full text searching
                
        foreach ($ret['actors'] as $value) {
            if (isset($value['order']))  {
                array_push($ret['actor_order'], $value['order']['name']);
            }
            if (isset($value['place']['diocese']))  {
                array_push($ret['actor_diocese'], $value['place']['diocese']['name']);
            }
            if (isset($value['place']['name']))  {
                array_push($ret['actor_place'], $value['place']['name']);
            }
            if (isset($value['place']['principality']))  {
                array_push($ret['actor_principality'], $value['place']['principality']['name']);
            }
            if (isset($value['name']['full_name']))  {
                array_push($ret['actor_name'], $value['name']['full_name']);
            }
            if (isset($value['capacity']))  {
                array_push($ret['actor_capacity'], $value['capacity']['name']);
            }
        }
        
        if (count($ret['udt']) > 0 ) {
            foreach ($ret['udt'] as $value) {
                if ( ($value['year'] != 0 ) && ($value['month'] != 0 ) && ($value['day'] != 0 ) ) {
                    array_push($ret['date'],strtotime(strval($value['year']) . '-' . strval($value['month']) . '-' . strval($value['day'])));
                    // echo strval($value['year']) . '-' . strval($value['month']) . '-' . strval($value['day']) ;
                } elseif ( ($value['year'] != 0 ) && ($value['month'] != 0 ) && ($value['day'] == 0 ) ) {
                    array_push($ret['date'],strtotime(strval($value['year']) . '-' . strval($value['month']) . '-28'));
                    // echo strval($value['year']) . '-' . strval($value['month'] . '- 28' ) ; 
                } elseif ( ($value['year'] != 0 ) && ($value['month'] == 0 ) && ($value['day'] == 0 ) ) {
                    array_push($ret['date'],strtotime(strval($value['year']) . '-12-31')); 
                    // echo strval($value['year']) . '-12-31';
                } else {
                    array_push($ret['date'],NULL);
                }
            }
        }          
        
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
