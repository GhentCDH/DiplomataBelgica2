<?php

namespace App\Command;

use App\Model\Charter;
use App\Repository\CharterRepository;
use App\Repository\RepositoryInterface;
use App\Resource\ElasticCharterResource;
use App\Resource\ElasticTraditionResource;
use App\Service\ElasticSearch\Index\CharterIndexService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
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
                case 'tradition':
                    /*
                     *  index original / copy / codex in same index
                     *  - create resources types for these tables
                     * - add 'type' property for each resource type
                     */

                    /** @var $service CharterIndexService */
                    $service = $this->container->get('tradition_index_service');
                    $indexName = $service->createNewIndex();

                    $total = 0;
                    $repositories = ['original_repository', 'copy_repository', 'codex_repository' ];
//                    $repositories = ['codex_repository' ];

                    /*** @var $repository RepositoryInterface */
                    foreach( $repositories as $repository_name ) {
                        $repository = $this->container->get($repository_name);
                        $total += $repository->indexQuery()->count();
                    }

                    // go!
                    $progressBar = new ProgressBar($output, $total);
                    $progressBar->start();

                    /*** @var $repository RepositoryInterface */
                    foreach( $repositories as $repository_name ) {
                        $repository = $this->container->get($repository_name);
                        $repository->indexQuery()->chunk(100,
                            function($res) use ($service, &$count, $progressBar) {
                                /** @var Charter $charter */
                                foreach ($res as $charter) {
                                    $res = new ElasticTraditionResource($charter->translate('en'));
                                    $service->add($res);
                                    $count++;
                                }

                                $progressBar->advance(100);
                            });
                    }

                    $service->switchToNewIndex($indexName);
                    $progressBar->finish();

                    break;

                case 'charter':
                    /** @var $repository CharterRepository */
                    $repository = $this->container->get('charter_repository' );

                    /** @var $service CharterIndexService */
                    $service = $this->container->get('charter_index_service');
                    $indexName = $service->createNewIndex();

                    $total = $repository->indexQuery()->count();

                    // go!
                    $progressBar = new ProgressBar($output, $total);
                    $progressBar->start();

                    $repository->indexQuery()->chunk(100,
                        function($res) use ($service, &$count, $progressBar) {
                            /** @var Charter $charter */
                            foreach ($res as $charter) {
                                $res = new ElasticCharterResource($charter->translate('en'));
                                $service->add($res);
                                $count++;
                            }

                            $progressBar->advance(100);
                        });

                    $service->switchToNewIndex($indexName);

                    $progressBar->finish();

                    break;
            }
        }

        $io->success("Succesfully indexed {$count} records");

        return Command::SUCCESS;
    }
}
