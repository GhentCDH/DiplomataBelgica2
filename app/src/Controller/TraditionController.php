<?php

namespace App\Controller;

use App\Service\ElasticSearch\Search\TraditionSearchService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class TraditionController extends BaseController
{
    protected string $templateFolder = 'Tradition';

    public function __construct(TraditionSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * @Route("/tradition", name="charter", methods={"GET"})
     */
    public function index(Request $request): RedirectResponse
    {
        return $this->redirectToRoute('tradition_search', ['request' =>  $request], 301);
    }

    /**
     * @Route("/tradition/search", name="tradition_search", methods={"GET"})
     */
    public function search(Request $request): Response {
        return $this->_search(
            $request,
            [
                'title' => 'Tradition'
            ],
            [
                'search_api' => 'tradition_search_api',
                'paginate' => 'tradition_paginate',
            ]
        );
    }

    /**
     * @Route("/tradition/search_api", name="tradition_search_api", methods={"GET"})
     */
    public function searchAPI(Request $request): Response {
        return $this->_searchAPI($request);
    }

    /**
     * @Route("/tradition/paginate", name="tradition_paginate", methods={"GET"})
     */
    public function paginate(Request $request): Response {
        return $this->_paginate($request);
    }

    /**
     * @Route("/tradition/{tradition_type}/{id}", name="tradition_get_single", methods={"GET"})
     */
    public function getSingle(string $id, string $tradition_type, Request $request, ContainerInterface $container): Response
    {
        $resource_id = $tradition_type.':'.$id;

        if (in_array('application/json', $request->getAcceptableContentTypes())) {
            try {
                $resource = $this->searchService->getSingle($resource_id);
            } catch (NotFoundHttpException $e) {
                return new JsonResponse(
                    ['error' => ['code' => Response::HTTP_NOT_FOUND, 'message' => $e->getMessage()]],
                    Response::HTTP_NOT_FOUND
                );
            }
            return new JsonResponse($resource);
        } else {
            $resource = $this->searchService->getSingle($resource_id);

            return $this->render(
                $this->templateFolder. '/detail.html.twig',
                [
                    'urls' => json_encode($this->getSharedAppUrls()),
                    'data' => json_encode([
                        'tradition' => $resource
                    ])
                ]
            );
        }
    }
}
