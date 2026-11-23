<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php82\Rector\Encapsed\VariableInStringInterpolationFixerRector;
use Rector\Symfony\Symfony61\Rector\Class_\CommandPropertyToAttributeRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src',
    ])
    ->withSymfonyContainerXml(__DIR__ . '/var/cache/dev/App_KernelDevDebugContainer.xml')
    // Symfony upgrade sets, picked from the installed symfony/* versions
    ->withComposerBased(symfony: true)
    // @Route annotations -> #[Route] attributes
    ->withAttributesSets(symfony: true)
    ->withRules([
        // protected static $defaultName/$defaultDescription -> #[AsCommand]
        CommandPropertyToAttributeRector::class,
        // "${var}" -> "{$var}" (deprecated since PHP 8.2)
        VariableInStringInterpolationFixerRector::class,
    ]);
