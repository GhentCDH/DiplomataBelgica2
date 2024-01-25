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
    protected $templateFolder = 'Tradition';

    protected const searchServiceName = "tradition_search_service";
    protected const indexServiceName = "tradition_index_service";


    /**
     * @Route("/tradition", name="charter", methods={"GET"})
     * @param Request $request
     * @return RedirectResponse
     */
    public function index(Request $request)
    {
        return $this->redirectToRoute('tradition_search', ['request' =>  $request], 301);
    }

    /**
     * @Route("/tradition/search", name="tradition_search", methods={"GET"})
     * @param Request $request
     * @param TraditionSearchService $elasticService
     * @return Response
     */
    public function search(
        Request $request,
        TraditionSearchService $elasticService
    ) {
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
     * @param Request $request
     * @return JsonResponse
     */
    public function searchAPI(
        Request $request
    ) {
        return $this->_searchAPI($request);
    }

    /**
     * @Route("/tradition/paginate", name="tradition_paginate", methods={"GET"})
     * @param Request $request
     * @return JsonResponse
     */
    public function paginate(
        Request $request
    ) {
        return $this->_paginate($request);
    }

    /**
     * @Route("/tradition/{tradition_type}/{id}", name="tradition_get_single", methods={"GET"})
     * @param int $id
     * @param Request $request
     * @param ContainerInterface $container
     * @return JsonResponse|Response
     */
    public function getSingle(int $id, string $tradition_type, Request $request, ContainerInterface $container)
    {
        $elasticService = $this->getContainer()->get(self::indexServiceName);

        $resource_id = $tradition_type.':'.$id;

        if (in_array('application/json', $request->getAcceptableContentTypes())) {
            try {
                $resource = $elasticService->get($resource_id);
            } catch (NotFoundHttpException $e) {
                return new JsonResponse(
                    ['error' => ['code' => Response::HTTP_NOT_FOUND, 'message' => $e->getMessage()]],
                    Response::HTTP_NOT_FOUND
                );
            }
            return new JsonResponse($resource);
        } else {
            $resource = $elasticService->get($resource_id);

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

    /**
     * Sanitize data from request string
     * @param array $params
     * @return array
     */
    private function sanitize(array $params): array
    {
        return $params;
    }

}
