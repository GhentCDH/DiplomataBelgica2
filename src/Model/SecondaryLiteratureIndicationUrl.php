<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use ReflectionException;

/**
 * @property int secondary_literature_indication_url_id
 * @property int secondary_literature_indication_id
 * @property int secondary_literature_id
 * @property string url
 *
 * @package App\Model
 */
class SecondaryLiteratureIndicationUrl extends AbstractModel
{
}
