<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

interface TraditionModelInterface
{
    public function traditionType(): string;

    public function urls(): HasMany;
    public function images(): HasMany;
    public function imageUrls(): HasMany;
    public function repository(): BelongsTo;
}