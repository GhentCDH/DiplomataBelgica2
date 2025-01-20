<?php
namespace App\Helper;

class DibeQueryToElasticQuery
{
    public static function translate(string $query): string
    {
        /*
        TRANSLATE dibe syntax -> elastic search syntax
        * CHANGES:
        cond.tion -> cond?tion
        + -> AND
        , -> OR
        # -> NOT
        distance search, no order: /15(sciant; futuri; presentes) -> "sciant futuri presentes"~15
        distance search, order: %15(sciant; futuri; presentes) -> NO ALTERNATIVE YET
        * IDENTICAL:
        cond*on -> cond*on
        parentheses -> parentheses
        */

        $text = $query;

        // clean whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        // add whitespace before separator tokens
        $text = preg_replace('/([+,#])/',' $1 ', $text);

        // isolate proximity searches
        $replaces = [];
        preg_match_all('/\/(\d+)\(([^()]*)\)/u', $text, $matches);
        if (sizeof($matches[0]) >= 1) {
            for ($x = 0; $x < sizeof($matches[0]); $x++) {
                $single_group = $matches[0][$x];
                $number = $matches[1][$x];
                $inside_brackets = $matches[2][$x];
                $inside_brackets = preg_replace('/[^\w\d\s]/u', '', $inside_brackets); # filter wildcards
                $hash = md5(time());
                $replaces[$hash] = '"'.$inside_brackets.'"~'.$number;
                $text = str_replace($single_group, $hash, $text);
            }
        }

        // translate operators
        $text = preg_replace('/ \+ /', ' AND ', $text);
        $text = preg_replace('/ , /', ' OR ', $text);
        $text = preg_replace('/ # /', ' NOT ', $text);

        // translate wildcards
        // todo: fix prefix wildcard?
        $text = preg_replace('/\./', '?', $text);

        // clean all unwanted characters
        $text = preg_replace('/[^\w\s\-_()?*]/u', '', $text);

        // restore proximity search
        foreach ($replaces as $hash => $replace) {
            $text = str_replace($hash, $replace, $text);
        }

        // clean whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        return $text;
    }
}