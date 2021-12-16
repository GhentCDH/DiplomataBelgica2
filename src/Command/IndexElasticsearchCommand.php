<?php

namespace App\Command;

use App\Model\Charter;
use App\Repository\CharterRepository;

use App\Resource\ElasticCharterResource;
use App\Service\ElasticSearch\CharterIndexService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;

class IndexElasticsearchCommand extends Command
{
    protected static $defaultName = 'app:elasticsearch:index';
    protected static $defaultDescription = 'Drops the old elasticsearch index and recreates it.';

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
            ->addArgument('index', InputArgument::REQUIRED, 'Which index should be reindexed?')
            ->setHelp('This command allows you to reindex elasticsearch.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $count = 0;
        if ($index = $input->getArgument('index')) {
            switch ($index) {
                case 'charters':
                    /** @var $repository CharterRepository */
                    $repository = $this->container->get('charter_repository' );

                    /** @var $service CharterIndexService */
                    $service = $this->container->get('charter_index_service');
                    $service->setup();

                    $repository->indexQuery()->chunk(100,
                        function($res) use ($service, &$count) {
                            /** @var Charter $charter */
                            foreach ($res as $charter) {
                                $res = new ElasticCharterResource($charter->translate('en'));
                                $service->add($res);
                                $count++;
                            }
                        });

                    break;
            }
        }

        $io->success("Succesfully indexed {$count} records");

        return Command::SUCCESS;
    }
}
