<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    /**
     * @Route("/{_locale}/", name="default", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function index(Request $request)
    {
        $locale = $request->getLocale();
        return $this->render(
            'pages/index.html.twig');
    }

    /**
     * @Route("/{_locale}/about", name="about", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function about(Request $request)
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/about/about.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/copyright", name="copyright", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function copyright(Request $request)
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/copyright/copyright.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/contact", name="contact", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function contact(Request $request)
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/contact/contact.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/colophon", name="colophon", methods={"GET"})
     * @param Request $request
     * @return Response
     */
    public function colophon(Request $request)
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/colophon/colophon.$locale.html.twig");
    }

}
