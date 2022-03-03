<?php

namespace App\Command;

use App\Model\Charter;
use App\Repository\CharterRepository;
use App\Resource\ElasticCommunicativeGoalResource;
use App\Resource\ElasticCharterResource;
use App\Service\ElasticSearch\CharterIndexService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TestElasticsearchCommand extends Command
{
    protected static $defaultName = 'app:elasticsearch:test';
    protected static $defaultDescription = 'Test elasticsearch item representation.';

    protected $container = [];
    protected $di = [];

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct();
    }

    protected function configure()
    {
        $this->setDescription(self::$defaultDescription);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        /** @var $repository CharterRepository */
        $repository = $this->container->get('charter_repository');

        /** @var $service CharterIndexService */
        $service = $this->container->get('charter_index_service');
        $service->setup();

        /** @var $charter Charter */
        $charter = $repository->find(1);//7029);

        $res = new ElasticCharterResource($charter->translate('en'));
        $service->add($res);

        return Command::SUCCESS;
    }
}
