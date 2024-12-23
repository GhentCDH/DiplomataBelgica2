<?php

namespace App\Controller;

use App\Service\ElasticSearch\Search\CharterSearchService;
use App\Service\ElasticSearch\Search\TraditionSearchService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class CharterController extends BaseController
{
    protected string $templateFolder = 'Charter';

    public function __construct(CharterSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * @Route("/charter", name="charter", methods={"GET"})
     */
    public function index(Request $request): RedirectResponse
    {
        return $this->redirectToRoute('charter_search', ['request' =>  $request], 301);
    }

    /**
     * @Route("/charter/search", name="charter_search", methods={"GET"})
     */
    public function search(Request $request): Response
    {
        return $this->_search(
            $request,
            [
                'title' => 'Charters'
            ],
            [
                'search_api' => 'charter_search_api',
                'paginate' => 'charter_paginate',
            ]
        );
    }

    /**
     * @Route("/charter/aggregation_suggest", name="charter_aggregation_suggest", methods={"GET"})
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
            [ $field ]
        );

        return new JsonResponse($data);
    }

    /**
     * @Route("/charter/search_api", name="charter_search_api", methods={"GET"})
     */
    public function searchAPI(Request $request): Response
    {
        return $this->_searchAPI($request);
    }

    /**
     * @Route("/charter/paginate", name="charter_paginate", methods={"GET"})
     */
    public function paginate(Request $request): Response {
        return $this->_paginate($request);
    }

    /**
     * @Route("/charter/{id}", name="charter_get_single", methods={"GET"})
     */
    public function getSingle(string $id, Request $request): Response
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
            $data = $this->searchService->getSingle($id);

            return $this->render(
                $this->templateFolder. '/detail.html.twig',
                [
                    'urls' => json_encode($this->getSharedAppUrls()),
                    'data' => json_encode([
                        'charter' => $data
                    ])
                ]
            );
        }
    }
}
