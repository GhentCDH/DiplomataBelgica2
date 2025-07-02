
import { dibeLexer } from "./DibeLexer";
import { dibeParser } from "./DibeParser";
import { KeywordVisitor } from './KeywordVisitor';
export const useSearchSyntax = () => {

    const keywordVisitor = new KeywordVisitor();

    // The parse function is the main entry point for parsing input strings.
    const parse = (input: string): any => {
        // Tokenize the input string using the lexer
        const lexResult = dibeLexer.tokenize(input);
        if (lexResult.errors.length > 0) {
            throw new Error("Parsing errors detected", { cause: lexResult.errors });
        }        

        // Set the tokens for the parser
        dibeParser.input = lexResult.tokens;

        // Parse the input string using the parser
        const cst = dibeParser.query();
        if (dibeParser.errors.length > 0) {
            throw new Error("Parsing errors detected", { cause: dibeParser.errors });
        }

        return cst;
    };

    // validate the input string, returns true if valid, false otherwise
    // This function does not throw an error, it simply returns false if the input is invalid
    const validate = (input): boolean => {
        try {
            const cst = parse(input);
            return true;
        } catch (error) {
            return false;
        }
    };

    // get the keywords for the current search, optionally exclude keywords that are excluded by the NOT operator
    const getKeywords = (input): string[] => {
        if (typeof input !== "string") {
            throw new Error("Input must be a string");
        }

        const cst = parse(input);
        keywordVisitor.reset();
        return keywordVisitor.visit(cst);
    };

    return {
        parse,
        validate,
        getKeywords,
    };

}