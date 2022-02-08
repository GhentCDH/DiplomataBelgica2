<?php

namespace App\Controller;

use App\Service\ElasticSearch\CharterSearchService;
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
        return $this->render(
            $this->templateFolder. '/overview.html.twig',
            [
                'urls' => json_encode([
                    // @codingStandardsIgnoreStart Generic.Files.LineLength
                    'charter_search_api' => $this->generateUrl('charter_search_api'),
                    'charter_get_single' => $this->generateUrl('charter_get_single', ['id' => 'charter_id']),
                    // @codingStandardsIgnoreEnd
                ]),
                'data' => json_encode(
                    $elasticService->searchAndAggregate(
                        $this->sanitize($request->query->all())
                    )
                ),
                'identifiers' => json_encode([]),
                'managements' => json_encode([]),
                'title' => 'Charters'
            ]
        );
    }

    /**
     * @Route("/charter/search_api", name="charter_search_api", methods={"GET"})
     * @param Request $request
     * @param CharterSearchService $elasticService
     * @return JsonResponse
     */
    public function searchAPI(
        Request $request,
        CharterSearchService $elasticService
    ) {
        $result = $elasticService->searchAndAggregate(
            $this->sanitize($request->query->all())
        );

        return new JsonResponse($result);
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
        if (in_array('application/json', $request->getAcceptableContentTypes())) {
            try {
                $service = $container->get('charter_index_service');
                $resource = $service->get($id);
            } catch (NotFoundHttpException $e) {
                return new JsonResponse(
                    ['error' => ['code' => Response::HTTP_NOT_FOUND, 'message' => $e->getMessage()]],
                    Response::HTTP_NOT_FOUND
                );
            }
            return new JsonResponse($resource);
        } else {
            $service = $container->get('charter_index_service');
            $resource = $service->get($id);

            return $this->render(
                $this->templateFolder. '/detail.html.twig',
                [
                    'urls' => json_encode([
                        // @codingStandardsIgnoreStart Generic.Files.LineLength
                        'charter_search' => $this->generateUrl('charter_search'),
                        'charter_search_api' => $this->generateUrl('charter_search_api'),
                        'charter_get_single' => $this->generateUrl('charter_get_single', ['id' => 'charter_id']),
                        // @codingStandardsIgnoreEnd
                    ]),
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
