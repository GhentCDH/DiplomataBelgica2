<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    /**
     * @Route("/", name="default", methods={"GET"})
     */
    public function index(Request $request): Response
    {
        return $this->redirectToRoute("colophon");
    }

    /**
     * @Route("/{_locale}/", name="default_locale", methods={"GET"})
     */
    public function index_locale(Request $request): Response
    {
        return $this->redirectToRoute("colophon");
    }

    /**
     * @Route("/{_locale}/aboutt", name="about", methods={"GET"})
     */
    public function about(Request $request): Response
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/about/about.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/copyright", name="copyright", methods={"GET"})
     */
    public function copyright(Request $request): Response
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/copyright/copyright.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/contact", name="contact", methods={"GET"})
     */
    public function contact(Request $request): Response
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/contact/contact.$locale.html.twig");
    }

    /**
     * @Route("/{_locale}/colophon", name="colophon", methods={"GET"})
     */
    public function colophon(Request $request): Response
    {
        $locale = $request->getLocale();
        return $this->render(
            "pages/colophon/colophon.$locale.html.twig");
    }
}
