<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    protected $defaultTemplateFolder = 'Default';
    protected $aboutTemplateFolder = 'About';
    protected $copyrightTemplateFolder = 'Copyright';
    protected $contactTemplateFolder = 'Contact';


    /**
     * @Route("/", name="default", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function index(Request $request)
    {
        return $this->render(
            $this->defaultTemplateFolder. '/index.html.twig');
    }

    /**
     * @Route("/", name="about", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function about(Request $request)
    {
        return $this->render(
            $this->aboutTemplateFolder. '/about.html.twig');
    }

    /**
     * @Route("/", name="copyright", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function copyright(Request $request)
    {
        return $this->render(
            $this->copyrightTemplateFolder. '/copyright.html.twig');
    }

    /**
     * @Route("/", name="contact", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function contact(Request $request)
    {
        return $this->render(
            $this->contactTemplateFolder. '/contact.html.twig');
    }

}
