
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
            console.error("Lexer errors:", lexResult.errors);
            throw new Error("Parsing errors detected");
        }        

        // Set the tokens for the parser
        dibeParser.input = lexResult.tokens;

        // Parse the input string using the parser
        const cst = dibeParser.query();
        if (dibeParser.errors.length > 0) {
            console.error("Parsing errors:", dibeParser.errors);
            throw new Error("Parsing errors detected");
        }

        return cst;
    };

    // validate the input string, returns true if valid, false otherwise
    // This function does not throw an error, it simply returns false if the input is invalid
    const validate = (input): boolean => {
        if (input.trim() === "") {
            return true; // Empty input is considered valid
        }

        try {
            const cst = parse(input);
            return true;
        } catch (error) {
            console.error("Error validating syntax:", error);
            return false;
        }
    };

    // get the keywords for the current search, optionally exclude keywords that are excluded by the NOT operator
    const getKeywords = (input: string): string[] => {
        try {
            const cst = parse(input);
            keywordVisitor.reset();
            return keywordVisitor.visit(cst);
        } catch (error) {
            console.error("Error getting keywords:", error);
            return [];
        }
    };

    return {
        parse,
        validate,
        getKeywords,
    };

}