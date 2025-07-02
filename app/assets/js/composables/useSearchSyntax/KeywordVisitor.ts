import { dibeParser } from "./DibeParser";

const BaseDibeVisitor = dibeParser.getBaseCstVisitorConstructorWithDefaults();

export class KeywordVisitor extends BaseDibeVisitor{
  private keywords: string[] = [];

  constructor() {
    super();
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  reset() {
    this.keywords = [];
  }

  expression(ctx: any) {
    if (ctx.NotOperator) {
      return; // Skip expressions with NOT operator
    }
    if (ctx.Number) {
      this.keywords.push(ctx.Number[0].image);
    }
    if (ctx.Keyword) {
      this.keywords.push(ctx.Keyword[0].image);
    }
    if (ctx.KeywordWithWildcards) {
      this.keywords.push(ctx.KeywordWithWildcards[0].image);
    }
    if (ctx.distanceGroup) {
      this.visit(ctx.distanceGroup);
    }
    if (ctx.parenthesisExpression) {
      this.visit(ctx.parenthesisExpression);
    }
  }

  distanceGroup(ctx: any) {
    if (ctx.Keyword) {
      for (const keyword of ctx.Keyword) {
        this.keywords.push(keyword.image);
      }
    }
  }

  query(ctx: any) {
    if (ctx.expression) {
      for (const expr of ctx.expression) {
        this.visit(expr);
      }
    }

    return this.keywords;
  }

}   