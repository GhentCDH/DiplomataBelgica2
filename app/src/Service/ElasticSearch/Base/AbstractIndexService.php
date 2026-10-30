<?php

namespace App\Service\ElasticSearch\Base;

use App\Resource\ResourceInterface;
use Elastica\Document;
use Elastica\Mapping;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Ramsey\Uuid\Uuid;

abstract class AbstractIndexService extends AbstractService implements IndexServiceInterface
{
    abstract protected function getIndexProperties(): array;

    abstract protected function getMappingProperties(): array;

    public function setup(): void
    {
        $index = $this->getIndex();

        // delete index
        if ($index->exists()) {
            $index->delete();
        }

        // configure analysis
        $index->create($this->getIndexPropertiesWithDefaults());

        // configure mapping
        $mapProperties = $this->getMappingProperties();
        if (count($mapProperties)) {
            $mapping = new Mapping;
            $mapping->setProperties($mapProperties);
            $mapping->send($this->getIndex());
        }
    }

    /**
     * Elasticsearch refuses from + size beyond max_result_window (default 10000), which made
     * every result page after 10000 records (e.g. the "Last" button) fail. Allow paging
     * through the whole collection.
     */
    const MAX_RESULT_WINDOW = 100000;

    protected function getIndexPropertiesWithDefaults(): array
    {
        $properties = $this->getIndexProperties();
        $properties['settings']['max_result_window'] = static::MAX_RESULT_WINDOW;
        return $properties;
    }

    public function createNewIndex(): string
    {
        $newIndexName = $this->getIndexName().'_'.Uuid::uuid4()->toString();

        // create index
        $index = $this->client->getIndex($newIndexName);
        $index->create($this->getIndexPropertiesWithDefaults());

        // configure mapping
        $mapProperties = $this->getMappingProperties();
        if (count($mapProperties)) {
            $mapping = new Mapping;
            $mapping->setProperties($mapProperties);
            $mapping->send($index);
        }

        $this->index = $index;

        return $newIndexName;
    }

    public function switchToNewIndex(string $newIndexName): void
    {
        $alias = $this->getIndexName();
        $oldIndices = $this->client->getStatus()->getIndicesWithAlias($alias);

        // move the alias in one request, so searches never hit a missing index
        $this->client->getIndex($newIndexName)->addAlias($alias, true);

        foreach ($oldIndices as $oldIndex) {
            if ($oldIndex->getName() !== $newIndexName) {
                $this->removeIndex($oldIndex->getName());
            }
        }
    }

    public function addMultiple(ResourceCollection $resources): void
    {
        $documents = [];
        foreach( $resources as $resource ) {
            $documents[] = new Document($resource->getId(), $resource->toJson());
        }
        $this->getIndex()->addDocuments($documents);
        $this->getIndex()->refresh();
    }

    public function add(ResourceInterface $resource): void
    {
        $document = new Document($resource->getId(), $resource->toJson());
        $this->getIndex()->addDocument($document);
        $this->getIndex()->refresh();
    }

    public function delete(string $id): void
    {
        $this->getIndex()->deleteById($id);
        $this->getIndex()->refresh();
    }

    public function deleteMultiple(array $ids): void
    {
        $this->getClient()->deleteIds($ids, $this->getIndex());
        $this->getIndex()->refresh();
    }

    public function get(string $id): array|string {
        $ret = $this->getIndex()->getDocument($id)->getData();
        return $ret;
    }

    /*
    public function updateMultiple(array $data): void
    {
        $bulk_documents = [];
        while (count($data) > 0) {
            $bulk_contents = array_splice($data, 0, 500);
            foreach ($bulk_contents as $bc) {
                $bulk_documents[] = new Document($bc['id'], $bc);
            }
            $this->getIndex()->updateDocuments($bulk_documents);
            $bulk_documents = [];
        }
        $this->getIndex()->refresh();
    }
    */
}
