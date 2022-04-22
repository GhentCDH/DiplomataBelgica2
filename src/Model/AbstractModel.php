<?php
namespace App\Model;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use ReflectionClass;
use ReflectionException;
use function Symfony\Component\String\u;

abstract class AbstractModel extends Model
{
    use TraitMultilangAttributes;
    use TraitCustomModelSchema;

    protected $primaryKey;
    protected $table;

    public $timestamps = false;

    /**
     * BaseModel constructor.
     * - snake case table names
     * - tablename_id primary key
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->initSchema();
    }
}