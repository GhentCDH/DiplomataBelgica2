<?php
namespace App\Controller;

use App\Service\ElasticSearch\Base\SearchServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class BaseController extends AbstractController
{
    /**
     * The folder where relevant templates are located.
     */
    protected string $templateFolder;
    protected SearchServiceInterface $searchService;

    /**
     * Return shared urls
     * @return array
     */
    protected function getSharedAppUrls(): array {
        // urls
        $urls = [
            // charter
            'charter_search' => $this->generateUrl('charter_search'),
            'charter_search_api' => $this->generateUrl('charter_search_api'),
            'charter_paginate' => $this->generateUrl('charter_paginate'),
            'charter_get_single' => $this->generateUrl('charter_get_single', ['id' => 'charter_id']),
            'charter_aggregation_suggest' => $this->generateUrl('charter_aggregation_suggest'),

            // tradition
            'tradition_search' => $this->generateUrl('tradition_search'),
            'tradition_search_api' => $this->generateUrl('tradition_search_api'),
            'tradition_paginate' => $this->generateUrl('tradition_paginate'),
            'tradition_get_single' => $this->generateUrl('tradition_get_single', ['id' => 'tradition_id', 'tradition_type' => 'tradition_type']),
        ];

        return $urls;
    }


    protected function _paginate(Request $request): Response {
        // search
        $data = $this->searchService->searchRAW(
            $request->query->all(),
            ['id']
        );

        // return array of id's
        $result = [];
        foreach($data['data'] as $item) {
            $result[] = $item['id'];
        }

        return new JsonResponse($result);
    }

    protected function _searchAPI(Request $request): Response {
        try {
            if ($request->query->getBoolean('aggregate', true)) {
                // get data
                $data = $this->searchService->searchAndAggregate(
                    $this->sanitizeSearchRequest($request->query->all())
                );
            } else {
                $data = $this->searchService->search(
                    $this->sanitizeSearchRequest($request->query->all())
                );
            }

            return new JsonResponse($data);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage(), 'type' => get_class($e) ], 400);
        }
    }

    protected function _search(Request $request, array $props = [], array $extraRoutes = []): Response {
        // urls
        $urls = $this->getSharedAppUrls();
        foreach( $extraRoutes as $key => $val ) {
            $urls[$key] = $urls[$val] ?? $val;
        }

        // html response
        return $this->render(
            $this->templateFolder. '/overview.html.twig',
            [
                'urls' => json_encode($urls),
            ] + $props
        );
    }

    /**
     * Sanitize data from request string
     * @param array $params
     * @return array
     */
    protected function sanitizeSearchRequest(array $params): array
    {
        return $params;
    }

}