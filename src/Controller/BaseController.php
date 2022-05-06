<?php
namespace App\Controller;

use App\Service\ElasticSearch\AbstractSearchService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;



class BaseController extends AbstractController
{
    /**
     * The folder where relevant templates are located.
     *
     * @var string
     */
    protected $templateFolder;

    /**
     * @var ContainerInterface
     */
    protected $mycontainer;

    public function __construct(ContainerInterface $container) {
        $this->mycontainer = $container;
    }

    protected function getContainer() {
        return $this->mycontainer;
    }

    /**
     * Return shared urls
     * @return array
     */
    protected function getSharedAppUrls() {
        // urls
        $urls = [
            // searches
            'charter_search' => $this->generateUrl('charter_search'),
            'charter_search_api' => $this->generateUrl('charter_search_api'),
            'charter_paginate' => $this->generateUrl('charter_paginate'),
            'charter_get_single' => $this->generateUrl('charter_get_single', ['id' => 'charter_id']),
        ];

        return $urls;
    }


    protected function _paginate(Request $request) {
        $elasticService = $this->getContainer()->get(static::searchServiceName);

        // search
        $data = $elasticService->searchRAW(
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

    protected function _searchAPI(Request $request) {
        $elasticService = $this->getContainer()->get(static::searchServiceName);

        // get data
        $data = $elasticService->searchAndAggregate(
            $this->sanitizeSearchRequest($request->query->all())
        );

        return new JsonResponse($data);
    }

    protected function _search(Request $request, array $props = [], array $extraRoutes = []) {
        $elasticService = $this->getContainer()->get(static::searchServiceName);

        // get data
        $data = $elasticService->searchAndAggregate(
            $this->sanitizeSearchRequest($request->query->all())
        );

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
                'data' => json_encode($data),
                'identifiers' => json_encode([]),
                'managements' => json_encode([]),
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