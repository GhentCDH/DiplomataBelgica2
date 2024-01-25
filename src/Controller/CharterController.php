<?php

namespace App\Controller;

use App\Service\ElasticSearch\Search\CharterSearchService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class CharterController extends BaseController
{
    protected $templateFolder = 'Charter';

    protected const searchServiceName = "charter_search_service";
    protected const indexServiceName = "charter_index_service";


    /**
     * @Route("/charter", name="charter", methods={"GET"})
     * @param Request $request
     * @return RedirectResponse
     */
    public function index(Request $request)
    {
        return $this->redirectToRoute('charter_search', ['request' =>  $request], 301);
    }

    /**
     * @Route("/charter/search", name="charter_search", methods={"GET"})
     * @param Request $request
     * @param CharterSearchService $elasticService
     * @return Response
     */
    public function search(
        Request $request,
        CharterSearchService $elasticService
    ) {
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
     * @Route("/charter/search_api", name="charter_search_api", methods={"GET"})
     * @param Request $request
     * @return JsonResponse
     */
    public function searchAPI(
        Request $request
    ) {
        return $this->_searchAPI($request);
    }

    /**
     * @Route("/charter/paginate", name="charter_paginate", methods={"GET"})
     * @param Request $request
     * @return JsonResponse
     */
    public function paginate(
        Request $request
    ) {
        return $this->_paginate($request);
    }

    /**
     * @Route("/charter/{id}", name="charter_get_single", methods={"GET"})
     * @param int $id
     * @param Request $request
     * @param ContainerInterface $container
     * @return JsonResponse|Response
     */
    public function getSingle(int $id, Request $request, ContainerInterface $container)
    {
        $elasticService = $this->getContainer()->get(self::indexServiceName);

        if (in_array('application/json', $request->getAcceptableContentTypes())) {
            try {
                $resource = $elasticService->get($id);
            } catch (NotFoundHttpException $e) {
                return new JsonResponse(
                    ['error' => ['code' => Response::HTTP_NOT_FOUND, 'message' => $e->getMessage()]],
                    Response::HTTP_NOT_FOUND
                );
            }
            return new JsonResponse($resource);
        } else {
            $resource = $elasticService->get($id);

            return $this->render(
                $this->templateFolder. '/detail.html.twig',
                [
                    'urls' => json_encode($this->getSharedAppUrls()),
                    'data' => json_encode([
                        'charter' => $resource
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
