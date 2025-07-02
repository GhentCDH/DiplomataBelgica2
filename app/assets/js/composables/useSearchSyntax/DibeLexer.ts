import {createToken, Lexer} from "chevrotain";

export const SemiColon = createToken({name: "SemiColon", pattern: /;/, label: "';'"});
export const ForwardSlash = createToken({name: "ForwardSlash", pattern: /\//, label: "'/'"});

export const Number = createToken({
    name: "Number",
    pattern: /\d+/,
    label: "Number",
});

export const LeftParenthesis = createToken({name: "LeftParenthesis", pattern: /\(/, label: "'('"});
export const RightParenthesis = createToken({name: "RightParenthesis", pattern: /\)/, label: "')'"});

export const NotOperator = createToken({name: "NotOperator", pattern: /#/, label: " NOT "});
export const AndOperator = createToken({name: "AndOperator", pattern: /\+/, label: " AND "});
export const OrOperator = createToken({name: "OrOperator", pattern: /,/, label: " OR "});

export const KeywordWithWildcards = createToken({
    name: "KeywordWithWildcards",
    pattern: /\*?[\w\d.]+\*?/,
});
export const Keyword = createToken({
    name: "Keyword",
    pattern: /[\d\w]+/,
    longer_alt: KeywordWithWildcards,
});
export const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
});
export const dibeTokens = [
    WhiteSpace,
    SemiColon,
    ForwardSlash,
    LeftParenthesis,
    RightParenthesis,
    NotOperator,
    AndOperator,
    OrOperator,
    Number,
    Keyword,
    KeywordWithWildcards,
];
export const dibeLexer = new Lexer(dibeTokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    positionTracking: "onlyStart",
});