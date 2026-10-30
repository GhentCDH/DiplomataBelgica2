<?php

namespace App\Command;

use App\Model\Charter;
use App\Repository\CharterRepository;
use App\Resource\ElasticSearch\ElasticCharterResource;
use App\Service\ElasticSearch\Base\AbstractService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TestElasticsearchCommand extends Command
{
    protected static $defaultName = 'app:elasticsearch:test';
    protected static $defaultDescription = 'Print the elasticsearch document of a charter.';

    protected $container = [];
    protected $di = [];

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct();
    }

    protected function configure()
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('id', InputArgument::OPTIONAL, 'Charter id', 1)
            ->addOption('locale', 'l', InputOption::VALUE_REQUIRED, 'Locale', AbstractService::DEFAULT_LOCALE);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        /** @var $repository CharterRepository */
        $repository = $this->container->get('charter_repository');

        /** @var $charter Charter */
        $charter = $repository->indexQuery()->find($input->getArgument('id'));
        if (!$charter) {
            $output->writeln('<error>Charter not found</error>');
            return Command::FAILURE;
        }

        // print the document as it would be indexed in the index of this locale
        $res = new ElasticCharterResource($charter->translate($input->getOption('locale')));
        $output->writeln(json_encode($res->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $charter->translate(AbstractService::DEFAULT_LOCALE);

        return Command::SUCCESS;
    }
}
