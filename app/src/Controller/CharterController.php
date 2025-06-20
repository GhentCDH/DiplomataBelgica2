<?php

namespace App\Controller;

use App\Service\ElasticSearch\Search\CharterSearchService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class CharterController extends BaseController
{
    protected string $templateFolder = 'pages/charter';

    public function __construct(CharterSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * @Route("/{_locale}/charters", name="charter_search", methods={"GET"})
     */
    public function charters(Request $request): Response
    {
        $urls = $this->getSharedAppUrls();
        return $this->render(
            $this->templateFolder . '/search.html.twig',
            [
                'title' => 'Charters',
                'urls' => json_encode(array_merge($urls, [
                    'search_api' => $urls['charter_search_api'],
                    'paginate' => $urls['charter_paginate'],
                ])),
            ]
        );
    }

    /**
     * @Route("/{_locale}/charters/{id}", name="charter_get_single", priority=-10, methods={"GET"})
     */
    public function charter(string $id, Request $request): Response
    {
        if (in_array('application/json', $request->getAcceptableContentTypes())) {
            try {
                $data = $this->searchService->getSingle($id);
            } catch (NotFoundHttpException $e) {
                return new JsonResponse(
                    ['error' => ['code' => Response::HTTP_NOT_FOUND, 'message' => $e->getMessage()]],
                    Response::HTTP_NOT_FOUND
                );
            }
            return new JsonResponse($data);
        } else {

            return $this->render(
                $this->templateFolder . '/detail.html.twig',
                [
                    'urls' => json_encode($this->getSharedAppUrls()),
                ]
            );
        }
    }

    /**
     * @Route("/{_locale}/charters/search_syntax", name="charter_search_syntax", methods={"GET"})
     */
    public function searchSyntax(Request $request): Response
    {
        $locale = $request->getLocale();
        return $this->render(
            $this->templateFolder . "/search_syntax.$locale.html.twig",
            [
                'page_title' => 'Search syntax',
            ]
        );
    }

    /**
     * @Route("/{_locale}/charters/aggregation_suggest", name="charter_aggregation_suggest", methods={"GET"})
     */
    public function aggregation_suggest(Request $request): Response
    {
        $filters = $request->query->all('filters', []);
        $field = $request->query->get('field');
        $value = $request->query->get('value');

        if (!$field) {
            return new JsonResponse([]);
        }

        // construct prefix filter
        $filters["${field}:prefix"] = $value;

        // get data
        $data = $this->searchService->aggregate(
            $filters,
            [$field]
        );

        return new JsonResponse($data);
    }

    /**
     * @Route("/{_locale}/charters/search", name="charter_search_api", methods={"GET"})
     */
    public function search(Request $request): Response
    {
        $mode = SearchMode::fromValue($request->query->get('mode', null)) ?: SearchMode::SEARCH_AGGREGATE;

        return $this->_searchAPI($request, $mode, excludeAggregationKeys: ['actorPlaces', 'charterPlaces']);
    }

    /**
     * @Route("/{_locale}/charters/locate", name="charter_locate", methods={"GET"})
     */
    public function locate(Request $request): Response
    {
        return $this->_searchAPI($request, SearchMode::AGGREGATE, useAggregationKeys: ['actorPlaces', 'charterPlaces'], callback: [$this, 'cleanLocationData']);
    }

    /**
     * @Route("/{_locale}/charters/paginate", name="charter_paginate", methods={"GET"})
     */
    public function paginate(Request $request): Response
    {
        return $this->_paginate($request);
    }

    protected function cleanLocationData($data)
    {
        $places = [];
        // walk actorPlaces aggregation
        $actorPlaces = $data['actorPlaces'] ?? [];
        foreach ($data['actorPlaces'] as $actorPlace) {
            // skip if no lat/long
            if (!isset($actorPlace['latitude']) || !isset($actorPlace['longitude'])) {
                continue;
            }
            if (!isset($places[$actorPlace['id']])) {
                // clean actor data
                $actors = [];
                if (isset($actorPlace['actors']) && is_array($actorPlace['actors'])) {
                    foreach ($actorPlace['actors'] as $actor) {
                        $actors[] = [
                            'id' => $actor['id'],
                            'name' => $actor['label'],
                            'count' => $actor['count'],
                            'roles' => array_map(fn($role) => [
                                'id' => $role['id'],
                                'charterIds' => $role['charters']['charter_id'] ?? [],
                            ], $actor['roles'] ?? []),
                        ];
                    }
                }

                // add place
                $places[$actorPlace['id']] = [
                    'id' => $actorPlace['id'],
                    'name' => $actorPlace['name'],
                    'latitude' => $actorPlace['latitude'],
                    'longitude' => $actorPlace['longitude'],
                    'actors' => $actors,
                    'charterIds' => [],
                ];
            }
        }

        // walk charterPlaces aggregation
        $charterPlaces = $data['charterPlaces'] ?? [];
        foreach ($charterPlaces as $charterPlace) {
            if (!isset($charterPlace['latitude']) || !isset($charterPlace['longitude'])) {
                continue;
            }
            if (!isset($places[$charterPlace['id']])) {
                $places[$charterPlace['id']] = [
                    'id' => $charterPlace['id'],
                    'name' => $charterPlace['name'],
                    'latitude' => $charterPlace['latitude'],
                    'longitude' => $charterPlace['longitude'],
                    'actors' => [],
                    'charterIds' => $charterPlace['charter_id'] ?? [],
                ];
            } else {
                $places[$charterPlace['id']]['charterIds'] = $charterPlace['charter_id'] ?? [];
            }
        }

        return array_values($places);
    }

}
