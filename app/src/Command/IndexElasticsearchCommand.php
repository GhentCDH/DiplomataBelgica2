<?php

namespace App\Command;

use App\Model\AbstractModel;
use App\Model\AbstractPivot;
use App\Repository\CharterRepository;
use App\Repository\RepositoryInterface;
use App\Resource\ElasticSearch\ElasticCharterResource;
use App\Resource\ElasticSearch\ElasticTraditionResource;
use App\Service\ElasticSearch\Base\AbstractIndexService;
use App\Service\ElasticSearch\Index\CharterIndexService;
use App\Service\ElasticSearch\Index\TraditionIndexService;
use InvalidArgumentException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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
            ->addArgument('maxItems', InputArgument::OPTIONAL, 'Max number of items to index')
            ->addOption('locale', 'l', InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY, 'Locale(s) to index (default: all index locales)')
            ->setHelp('This command allows you to reindex elasticsearch. Each locale has its own index ({prefix}_{index}_{locale}).');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $chunkSize = 200;

        $count = 0;
        $maxItems = $input->getArgument('maxItems');
        if ($index = $input->getArgument('index')) {
            switch ($index) {
                case 'tradition':
                    /*
                     *  index original / copy / codex in same index
                     *  - create resources types for these tables
                     * - add 'type' property for each resource type
                     */

                    /** @var $service TraditionIndexService */
                    $service = $this->container->get('tradition_index_service');
                    $services = $this->localeServices($service, $input->getOption('locale'));
                    $indexNames = $this->createNewIndices($services);

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
                        $repository->indexQuery()->chunk($chunkSize,
                            function($traditions) use ($services, &$count, $progressBar, $maxItems) {
                                if ( $maxItems && $count >= $maxItems ) {
                                    return false;
                                }

                                // index traditions, once per locale
                                foreach ($services as $locale => $localeService) {
                                    $this->setModelLocale($locale);
                                    $localeService->addMultiple(ElasticTraditionResource::collection($traditions));
                                }
                                $count += $traditions->count();

                                // update progress bar
                                $progressBar->advance($traditions->count());
                            });
                    }

                    $this->switchToNewIndices($services, $indexNames);
                    $progressBar->finish();

                    break;

                case 'charter':
                    /** @var $repository CharterRepository */
                    $repository = $this->container->get('charter_repository' );

                    /** @var $service CharterIndexService */
                    $service = $this->container->get('charter_index_service');
                    $services = $this->localeServices($service, $input->getOption('locale'));
                    $indexNames = $this->createNewIndices($services);

                    $total = $repository->indexQuery()->count();

                    // go!
                    $progressBar = new ProgressBar($output, $total);
                    $progressBar->start();

                    $repository->indexQuery()->chunk(100,
                        function($charters) use ($services, &$count, $progressBar, $maxItems): bool {
                            if ( $maxItems && $count >= $maxItems ) {
                                return false;
                            }

                            // index charters, once per locale
                            foreach ($services as $locale => $localeService) {
                                $this->setModelLocale($locale);
                                $localeService->addMultiple(ElasticCharterResource::collection($charters));
                            }
                            $count += $charters->count();

                            // update progress bar
                            $progressBar->advance($charters->count());
                            return true;
                        });

                    $this->switchToNewIndices($services, $indexNames);

                    $progressBar->finish();

                    break;
            }
        }

        $this->setModelLocale(AbstractIndexService::DEFAULT_LOCALE);

        $io->success("Succesfully indexed {$count} records");

        return Command::SUCCESS;
    }

    /**
     * One index service per locale
     * @return AbstractIndexService[] locale => service
     */
    private function localeServices(AbstractIndexService $service, array $locales): array
    {
        $indexLocales = $service->getIndexLocales();
        $locales = $locales ?: $indexLocales;
        $unknown = array_diff($locales, $indexLocales);
        if ($unknown) {
            throw new InvalidArgumentException('Unknown locale(s): '.implode(', ', $unknown).'. Index locales: '.implode(', ', $indexLocales));
        }

        $services = [];
        foreach ($locales as $locale) {
            $services[$locale] = $service->forLocale($locale);
        }
        return $services;
    }

    private function createNewIndices(array $services): array
    {
        return array_map(fn(AbstractIndexService $service) => $service->createNewIndex(), $services);
    }

    /**
     * Only switch the aliases when every locale is indexed, so the locales stay in sync
     */
    private function switchToNewIndices(array $services, array $indexNames): void
    {
        foreach ($services as $locale => $service) {
            $service->switchToNewIndex($indexNames[$locale]);
        }
    }

    /**
     * Localized model attributes (name, ...) are resolved when a resource is serialized
     */
    private function setModelLocale(string $locale): void
    {
        AbstractModel::setLocale($locale);
        AbstractPivot::setLocale($locale);
    }
}
