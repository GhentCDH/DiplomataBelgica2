import { CstParser } from "chevrotain";
import {
    dibeTokens,
    NotOperator,
    AndOperator,
    OrOperator,
    Number,
    Keyword,
    KeywordWithWildcards,
    LeftParenthesis,
    RightParenthesis,
    SemiColon,
    ForwardSlash
} from "./DibeLexer";

class DibeParser extends CstParser {
    constructor() {
        super(dibeTokens, {
            recoveryEnabled: true,
        });
        const $ = this;

        $.RULE("query", () => {
            $.SUBRULE($.expression);
            $.MANY(() => {
                $.SUBRULE2($.booleanOperator);
                $.SUBRULE3($.expression);
            })
        });

        $.RULE("booleanOperator", () => {
            $.OR([
                { ALT: () => $.CONSUME(AndOperator) },
                { ALT: () => $.CONSUME(OrOperator) },
            ]);
        });

        $.RULE("distanceGroup", () => {
            $.CONSUME(ForwardSlash);
            $.CONSUME(Number);
            $.CONSUME(LeftParenthesis);
            $.AT_LEAST_ONE_SEP({
                SEP: SemiColon,
                DEF: () => {
                    $.CONSUME(Keyword);
                }
            });
            $.CONSUME(RightParenthesis);
        });

        $.RULE("parenthesisExpression", () => {
            $.CONSUME(LeftParenthesis);
            $.SUBRULE($.query);
            $.CONSUME(RightParenthesis);
        });

        $.RULE("expression", () => {
            $.OPTION(() => {
                $.CONSUME(NotOperator);
            });
            $.OR([
                { ALT:() => { $.CONSUME(Number) } },
                { ALT:() => { $.CONSUME(Keyword) } },
                { ALT:() => { $.CONSUME(KeywordWithWildcards) } },
                { ALT:() => { $.SUBRULE($.distanceGroup) } },
                { ALT:() => { $.SUBRULE($.parenthesisExpression) } }
            ])
        });

        // very important to call this after all the rules have been setup.
        // otherwise the parser may not work correctly as it will lack information
        // derived from the self analysis.
        this.performSelfAnalysis();
    }
}

export const dibeParser = new DibeParser();