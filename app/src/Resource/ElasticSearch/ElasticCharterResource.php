<?php

namespace App\Resource\ElasticSearch;

use App\Helper\DateSort;
use App\Model\Charter;
use App\Model\Place;
use App\Resource\ResourceInterface;
use Illuminate\Http\Request;

/**
 * Class ElasticCharterResource
 * @package App\Resource
 * @mixin Charter
 */
class ElasticCharterResource extends ElasticBaseResource implements ResourceInterface
{
    /** locales of the localized name columns (name_nl, name_fr, name_en) */
    private const NAME_LOCALES = ['nl', 'fr', 'en'];

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
        $ret['datations'] = ElasticBaseResource::collection($charter->datations)->toArray();
        $ret['originals'] = ElasticBaseResource::collection($charter->originals);
        $ret['vidimuses'] = ElasticBaseResource::collection($charter->vidimuses);
        $ret['images'] = [];
        $ret['imageUrls'] = [];
        $ret['date_sort'] = [];
        $ret['actor_name'] = [];
        $ret['actor_capacity'] = [];
        $ret['actor_place'] = [];
        $ret['actor_diocese'] = [];
        $ret['actor_principality'] = [];
        $ret['actor_order'] = [];

        // flatten required fields for full text searching
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

        // calculate sort date (based on preferential date)
        if (count($ret['datations']) > 0 ) {
            foreach ($ret['datations'] as $date) {
                if ($date['preference'] == 0) {
                    $ret['date_sort'][] = DateSort::value($date['time']['year'] ?? null, $date['time']['month'] ?? null, $date['time']['day'] ?? null);
                }
            }
        }          
        
        // collect the images and image links of all originals, manuscripts and copies
        // (each item also keeps its own imageUrls, shown next to it on the charter page)
        $images = collect();
        $imageUrls = collect();
        foreach ([$ret['originals'], $ret['codexes'], $ret['copies']] as $items) {
            foreach ($items as $value) {
                $images = $images->merge($value['images']);
                $imageUrls = $imageUrls->merge($value['imageUrls']);
            }
        }
        $ret['images'] = $images->values()->all();
        $ret['imageUrls'] = $imageUrls->values()->all();

        $ret['has_images'] = self::boolean( (
            (count($ret['images']) > 0)
            || (count($ret['imageUrls']) > 0)
        ) ? 1 : 0 );

        $ret['image_count'] = count($ret['images']);

        $ret['search_text'] = self::searchText($charter);

        return $ret;
    }

    /**
     * Bundle searched by the plain full-text search (filters[q]); never returned to the browser.
     * Names take every localized spelling, so a name can be found in any language; the summary is the
     * one of the index locale.
     */
    private static function searchText(Charter $charter): array
    {
        $text = new SearchTextBuilder();
        $text->add('summary', $charter->summary);
        $text->add('full_text', $charter->full_text);

        foreach ($charter->actors as $actor) {
            $name = $actor->name;
            if ($name) {
                $text->add('actor_names', array_map(fn($locale) => $name->getAttributeValue('name_' . $locale), self::NAME_LOCALES));
                $standardized = $name->standardizedName;
                if ($standardized) {
                    $text->add('actor_names', $standardized->actor_standardized_name);
                    $text->add('actor_names', $standardized->name_variants->pluck('name')->all());
                }
            }
            $text->add('actor_places', self::placeNames($actor->place));
        }

        $text->add('place_date', self::placeNames($charter->place), $charter->place_found_name);

        return $text->toArray();
    }

    /**
     * All spellings of a place: the localized names and the regional one
     */
    private static function placeNames(?Place $place): array
    {
        if (!$place) {
            return [];
        }
        return array_map(fn($column) => $place->getAttributeValue($column), ['name_nl', 'name_fr', 'name_en', 'name_regio']);
    }
}
