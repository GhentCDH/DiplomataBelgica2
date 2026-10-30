<?php

namespace App\Helper;

/**
 * Sort key for the copies of charters in a manuscript, in manuscript order:
 * by sequence number when known, otherwise by the first folio/page of the
 * reference (e.g. "f°10 r° - v°.", "p.237 - 239."), recto before verso.
 * Copies without any reference come last.
 */
class CopyFolioSort
{
    public static function key(?string $sequenceNumber, ?string $pof): array
    {
        $sequence = is_numeric(trim($sequenceNumber ?? '')) ? (float) $sequenceNumber : PHP_INT_MAX;

        if ($pof !== null && preg_match('/(?:f°|fol\.?|p\.)\s*(\d+)\s*(r°|v°)?/u', $pof, $matches)) {
            $number = (int) $matches[1];
            $side = ($matches[2] ?? '') === 'v°' ? 1 : 0;
        } else {
            $number = PHP_INT_MAX;
            $side = 0;
        }

        return [$sequence, $number, $side, $pof ?? ''];
    }
}
