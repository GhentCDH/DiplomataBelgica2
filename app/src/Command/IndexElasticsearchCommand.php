<?php

namespace App\Command;

use App\Model\AbstractModel;
use App\Model\AbstractPivot;
use App\Repository\CharterRepository;
use App\Repository\CodexRepository;
use App\Repository\CopyRepository;
use App\Repository\OriginalRepository;
use App\Repository\RepositoryInterface;
use App\Resource\ElasticSearch\ElasticCharterResource;
use App\Resource\ElasticSearch\ElasticTraditionResource;
use App\Service\ElasticSearch\Base\AbstractIndexService;
use App\Service\ElasticSearch\Index\CharterIndexService;
use App\Service\ElasticSearch\Index\TraditionIndexService;
use InvalidArgumentException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:elasticsearch:index', description: 'Drops the old elasticsearch index and recreates it.')]
class IndexElasticsearchCommand extends Command
{
    /**
     * Tradition repositories, indexed in this order
     * @var RepositoryInterface[] name => repository
     */
    private array $traditionRepositories;

    public function __construct(
        private CharterRepository $charterRepository,
        OriginalRepository $originalRepository,
        CopyRepository $copyRepository,
        CodexRepository $codexRepository,
        private CharterIndexService $charterIndexService,
        private TraditionIndexService $traditionIndexService,
    )
    {
        $this->traditionRepositories = [
            'original_repository' => $originalRepository,
            'copy_repository' => $copyRepository,
            'codex_repository' => $codexRepository,
        ];
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
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

                    $service = $this->traditionIndexService;
                    $services = $this->localeServices($service, $input->getOption('locale'));
                    $indexNames = $this->createNewIndices($services);

                    $total = 0;
                    $repositories = array_keys($this->traditionRepositories);
//                    $repositories = ['codex_repository' ];

                    /*** @var $repository RepositoryInterface */
                    foreach( $repositories as $repository_name ) {
                        $repository = $this->traditionRepositories[$repository_name];
                        $total += $repository->indexQuery()->count();
                    }

                    // go!
                    $progressBar = new ProgressBar($output, $total);
                    $progressBar->start();

                    /*** @var $repository RepositoryInterface */
                    $this->indexOrCleanUp($services, $indexNames, function () use ($repositories, $chunkSize, $services, &$count, $progressBar, $maxItems) {
                        foreach( $repositories as $repository_name ) {
                            $repository = $this->traditionRepositories[$repository_name];
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
                    });

                    $this->switchToNewIndices($services, $indexNames);
                    $progressBar->finish();

                    break;

                case 'charter':
                    $repository = $this->charterRepository;
                    $service = $this->charterIndexService;
                    $services = $this->localeServices($service, $input->getOption('locale'));
                    $indexNames = $this->createNewIndices($services);

                    $total = $repository->indexQuery()->count();

                    // go!
                    $progressBar = new ProgressBar($output, $total);
                    $progressBar->start();

                    // a closure, not an arrow function: fn() captures $count by value, so the total would stay 0
                    $this->indexOrCleanUp($services, $indexNames, function () use ($repository, $services, &$count, $progressBar, $maxItems) {
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
     * Run the indexing; when it fails, remove the new (unused) indices and rethrow
     */
    private function indexOrCleanUp(array $services, array $indexNames, callable $index): void
    {
        try {
            $index();
        } catch (\Throwable $e) {
            foreach ($services as $locale => $service) {
                $service->removeIndex($indexNames[$locale]);
            }
            throw $e;
        }
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
