<?php

namespace App\Helper;

/**
 * Sortable number for a (possibly partial) date: yyyymmdd, unknown parts as 0,
 * so a date with an unknown day/month sorts before the known days of that month/year.
 */
class DateSort
{
    public static function value(?int $year, ?int $month, ?int $day): int
    {
        return ($year ?? 0) * 10000 + ($month ?? 0) * 100 + ($day ?? 0);
    }
}
