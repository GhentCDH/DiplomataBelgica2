<?php

namespace App\Command;

use App\Model\Charter;
use App\Repository\CharterRepository;
use App\Resource\ElasticSearch\ElasticCharterResource;
use App\Service\ElasticSearch\Base\AbstractService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:elasticsearch:test', description: 'Print the elasticsearch document of a charter.')]
class TestElasticsearchCommand extends Command
{
    public function __construct(private CharterRepository $charterRepository)
    {
        parent::__construct();
    }

    protected function configure()
    {
        $this
            ->addArgument('id', InputArgument::OPTIONAL, 'Charter id', 1)
            ->addOption('locale', 'l', InputOption::VALUE_REQUIRED, 'Locale', AbstractService::DEFAULT_LOCALE);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $repository = $this->charterRepository;

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
