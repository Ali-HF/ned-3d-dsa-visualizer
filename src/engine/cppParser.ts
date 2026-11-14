/**
 * Custom C++ Subset Lexer & Recursive-Descent AST Parser
 *
 * Parses user-written C++ DSA code into an AST where every statement and
 * expression carries its exact 1-based original C++ source line number.
 * Throws structured CppCompileError with line numbers on syntax errors or
 * unsupported C++ constructs.
 */

export class CppCompileError extends Error {
  public readonly line: number;
  public readonly kind: 'syntax' | 'unsupported';

  constructor(message: string, line: number, kind: 'syntax' | 'unsupported' = 'syntax') {
    super(
      kind === 'unsupported'
        ? `Unsupported syntax at line ${line}: ${message}`
        : `Syntax error at line ${line}: ${message}`,
    );
    this.name = 'CppCompileError';
    this.line = line;
    this.kind = kind;
  }
}

export type TokenType =
  | 'ident'
  | 'number'
  | 'string'
  | 'char'
  | 'punct'
  | 'op'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

export interface CppTypeInfo {
  baseType: string;
  templateArg?: string;
  isPointer: boolean;
  isReference: boolean;
  isArray: boolean;
  arraySizeExpr?: CppExpr | null;
  arrayDims?: CppExpr[];
}

export interface CppParam {
  name: string;
  typeInfo: CppTypeInfo;
  line: number;
}

export type CppExpr =
  | { kind: 'NumberLit'; value: number; line: number }
  | { kind: 'StringLit'; value: string; line: number }
  | { kind: 'BoolLit'; value: boolean; line: number }
  | { kind: 'NullLit'; line: number }
  | { kind: 'Ident'; name: string; line: number }
  | { kind: 'ThisExpr'; line: number }
  | { kind: 'InitList'; elements: CppExpr[]; line: number }
  | { kind: 'IndexExpr'; array: CppExpr; index: CppExpr; line: number }
  | { kind: 'MemberExpr'; object: CppExpr; member: string; isArrow: boolean; line: number }
  | { kind: 'CallExpr'; callee: CppExpr; args: CppExpr[]; line: number }
  | { kind: 'NewExpr'; className: string; args: CppExpr[]; isArray?: boolean; sizeExpr?: CppExpr; line: number }
  | { kind: 'UnaryExpr'; op: string; expr: CppExpr; prefix: boolean; line: number }
  | { kind: 'BinaryExpr'; op: string; left: CppExpr; right: CppExpr; line: number }
  | { kind: 'AssignExpr'; op: string; target: CppExpr; value: CppExpr; line: number }
  | { kind: 'ConditionalExpr'; test: CppExpr; consequent: CppExpr; alternate: CppExpr; line: number }
  | { kind: 'SizeofExpr'; targetExpr?: CppExpr; targetType?: string; line: number };

export interface VarDeclarator {
  name: string;
  typeInfo: CppTypeInfo;
  init: CppExpr | null;
  ctorArgs?: CppExpr[];
  line: number;
}

export interface SwitchCaseClause {
  test: CppExpr | null; // null for `default:`
  body: CppStmt[];
  line: number;
}

export type CppStmt =
  | { kind: 'BlockStmt'; body: CppStmt[]; line: number }
  | { kind: 'VarDeclStmt'; declarations: VarDeclarator[]; line: number }
  | { kind: 'ExprStmt'; expr: CppExpr; line: number }
  | { kind: 'IfStmt'; test: CppExpr; consequent: CppStmt; alternate: CppStmt | null; line: number }
  | { kind: 'SwitchStmt'; discriminant: CppExpr; cases: SwitchCaseClause[]; line: number }
  | {
    kind: 'ForStmt';
    init: CppStmt | null;
    test: CppExpr | null;
    update: CppExpr | null;
    body: CppStmt;
    line: number;
  }
  | {
    kind: 'ForRangeStmt';
    varName: string;
    secondVarName?: string;
    typeInfo: CppTypeInfo;
    iterable: CppExpr;
    body: CppStmt;
    line: number;
  }
  | { kind: 'WhileStmt'; test: CppExpr; body: CppStmt; line: number }
  | { kind: 'DoWhileStmt'; body: CppStmt; test: CppExpr; line: number }
  | { kind: 'ReturnStmt'; value: CppExpr | null; line: number }
  | { kind: 'BreakStmt'; line: number }
  | { kind: 'ContinueStmt'; line: number }
  | { kind: 'DeleteStmt'; target: CppExpr; line: number }
  | { kind: 'ThrowStmt'; expr: CppExpr; line: number }
  | { kind: 'EmptyStmt'; line: number };

export interface CppFuncDecl {
  kind: 'FuncDecl';
  name: string;
  returnType: CppTypeInfo;
  params: CppParam[];
  body: CppStmt[];
  line: number;
}

export interface CppFieldDecl {
  name: string;
  typeInfo: CppTypeInfo;
  defaultValue: CppExpr | null;
  line: number;
}

export interface CppCtorInitializer {
  field: string;
  expr: CppExpr;
}

export interface CppConstructorDecl {
  params: CppParam[];
  initializers: CppCtorInitializer[];
  body: CppStmt[];
  line: number;
}

export interface CppClassDecl {
  kind: 'ClassDecl';
  name: string;
  fields: CppFieldDecl[];
  constructors: CppConstructorDecl[];
  methods: CppFuncDecl[];
  line: number;
}

export interface CppProgram {
  classes: CppClassDecl[];
  functions: CppFuncDecl[];
  topLevelStatements: CppStmt[];
  enums: Record<string, number>;
}

const PRIMITIVE_TYPE_KEYWORDS = new Set([
  'void',
  'int',
  'long',
  'short',
  'signed',
  'unsigned',
  'float',
  'double',
  'bool',
  'char',
  'string',
  'size_t',
  'auto',
]);

const CONTAINER_TYPE_KEYWORDS = new Set([
  'vector',
  'stack',
  'queue',
  'deque',
  'priority_queue',
  'list',
  'map',
  'unordered_map',
  'set',
  'unordered_set',
  'pair',
  'greater',
  'less',
]);

const CV_QUALIFIERS = new Set(['const', 'static', 'inline', 'constexpr']);

const UNSUPPORTED_KEYWORDS = new Set([
  'goto',
  'try',
  'catch',
  'union',
  'virtual',
  'friend',
  'operator',
  'reinterpret_cast',
  'dynamic_cast',
  'asm',
]);

export function tokenizeCpp(source: string): Token[] {
  const tokens: Token[] = [];
  const defines = new Map<string, { type: TokenType; value: string }[]>();
  let i = 0;
  let line = 1;
  let lineStart = 0;

  const len = source.length;

  while (i < len) {
    const ch = source[i];

    if (ch === '\n') {
      line++;
      i++;
      lineStart = i;
      continue;
    }
    if (ch === '\r') {
      i++;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\f' || ch === '\v') {
      i++;
      continue;
    }

    // Preprocessor directive (#include, #define, #pragma)
    if (ch === '#') {
      const directiveLine = line;
      let dirEnd = i + 1;
      while (dirEnd < len && source[dirEnd] !== '\n') {
        if (source[dirEnd] === '\\' && dirEnd + 1 < len && source[dirEnd + 1] === '\n') {
          dirEnd += 2;
          line++;
          lineStart = dirEnd;
        } else {
          dirEnd++;
        }
      }
      const directiveText = source.slice(i + 1, dirEnd).trim();
      i = dirEnd;

      // Support simple object-like `#define NAME VALUE` constants
      const defineMatch = /^define\s+([a-zA-Z_][a-zA-Z0-9_]*)(\()?(.*)$/.exec(directiveText);
      if (defineMatch) {
        const macroName = defineMatch[1];
        const hasParen = defineMatch[2] === '(';
        const rest = (defineMatch[3] ?? '').trim();
        if (hasParen) {
          throw new CppCompileError(
            `Preprocessor function-like macro '#define ${macroName}(...)' is not supported`,
            directiveLine,
            'unsupported',
          );
        }
        // Strip trailing comments from macro body
        const cleanBody = rest.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (cleanBody.length > 0) {
          const bodyTokens = tokenizeCpp(cleanBody).filter((t) => t.type !== 'eof');
          defines.set(macroName, bodyTokens.map((t) => ({ type: t.type, value: t.value })));
        }
      }
      continue;
    }

    // Single-line comment
    if (ch === '/' && source[i + 1] === '/') {
      while (i < len && source[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Multi-line comment
    if (ch === '/' && source[i + 1] === '*') {
      const startLine = line;
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') {
          line++;
          lineStart = i + 1;
        }
        i++;
      }
      if (i >= len) {
        throw new CppCompileError('Unterminated block comment', startLine, 'syntax');
      }
      i += 2;
      continue;
    }

    const col = i - lineStart + 1;

    // String literal
    if (ch === '"') {
      const startLine = line;
      i++;
      let str = '';
      while (i < len && source[i] !== '"') {
        if (source[i] === '\n') {
          throw new CppCompileError('Unterminated string literal', startLine, 'syntax');
        }
        if (source[i] === '\\') {
          i++;
          const esc = source[i];
          if (esc === 'n') str += '\n';
          else if (esc === 't') str += '\t';
          else if (esc === 'r') str += '\r';
          else str += esc ?? '';
        } else {
          str += source[i];
        }
        i++;
      }
      if (i >= len) {
        throw new CppCompileError('Unterminated string literal', startLine, 'syntax');
      }
      i++; // consume closing quote
      tokens.push({ type: 'string', value: str, line: startLine, col });
      continue;
    }

    // Char literal
    if (ch === "'") {
      const startLine = line;
      i++;
      let val = '';
      while (i < len && source[i] !== "'") {
        if (source[i] === '\n') {
          throw new CppCompileError('Unterminated character literal', startLine, 'syntax');
        }
        if (source[i] === '\\') {
          i++;
          const esc = source[i];
          if (esc === 'n') val += '\n';
          else if (esc === 't') val += '\t';
          else if (esc === 'r') val += '\r';
          else if (esc === '0') val += '\0';
          else val += esc ?? '';
        } else {
          val += source[i];
        }
        i++;
      }
      if (i >= len) {
        throw new CppCompileError('Unterminated character literal', startLine, 'syntax');
      }
      i++;
      tokens.push({ type: 'char', value: val, line: startLine, col });
      continue;
    }

    // Number literal
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(source[i + 1] ?? ''))) {
      let numStr = '';
      if (ch === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X')) {
        numStr += source[i] + source[i + 1];
        i += 2;
        while (i < len && /[0-9a-fA-F]/.test(source[i])) {
          numStr += source[i++];
        }
      } else {
        while (i < len && (/\d/.test(source[i]) || source[i] === '.')) {
          numStr += source[i++];
        }
      }
      // Consume C++ integer/float suffixes like L, LL, U, UL, f, F
      while (i < len && /[uUlLfF]/.test(source[i])) {
        i++;
      }
      tokens.push({ type: 'number', value: numStr, line, col });
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < len && /[a-zA-Z0-9_]/.test(source[i])) {
        ident += source[i++];
      }
      // Collapse `std::foo` into `foo`
      if (ident === 'std' && source[i] === ':' && source[i + 1] === ':') {
        i += 2;
        continue;
      }
      // Expand object-like `#define` macro if defined
      const macroExpansion = defines.get(ident);
      if (macroExpansion) {
        for (const mt of macroExpansion) {
          tokens.push({ type: mt.type, value: mt.value, line, col });
        }
        continue;
      }
      tokens.push({ type: 'ident', value: ident, line, col });
      continue;
    }

    // Multi-character operators
    const threeChar = source.slice(i, i + 3);
    if (threeChar === '<<=' || threeChar === '>>=') {
      tokens.push({ type: 'op', value: threeChar, line, col });
      i += 3;
      continue;
    }

    const twoChar = source.slice(i, i + 2);
    if (
      [
        '->',
        '::',
        '<=',
        '>=',
        '==',
        '!=',
        '&&',
        '||',
        '++',
        '--',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '<<',
        '>>',
      ].includes(twoChar)
    ) {
      tokens.push({ type: 'op', value: twoChar, line, col });
      i += 2;
      continue;
    }

    // Punctuation
    if ('(){}[].,;:?~'.includes(ch)) {
      tokens.push({ type: 'punct', value: ch, line, col });
      i++;
      continue;
    }

    // Single-character operators
    if ('+-*/%<>=!&|^'.includes(ch)) {
      tokens.push({ type: 'op', value: ch, line, col });
      i++;
      continue;
    }

    throw new CppCompileError(`Unexpected character '${ch}'`, line, 'syntax');
  }

  tokens.push({ type: 'eof', value: '', line, col: 1 });
  return tokens;
}

export function parseCppProgram(source: string): CppProgram {
  const tokens = tokenizeCpp(source);
  let pos = 0;
  const knownClassNames = new Set<string>([
    'Node',
    'TreeNode',
    'ListNode',
    'BSTNode',
    'BST',
    'BinarySearchTree',
  ]);
  const enumConstants: Record<string, number> = {};

  // Pre-scan struct/class/enum/template names so pointer/value declarations work regardless of order
  for (let i = 0; i < tokens.length - 1; i++) {
    if (
      tokens[i].type === 'ident' &&
      (tokens[i].value === 'struct' || tokens[i].value === 'class' || tokens[i].value === 'enum') &&
      tokens[i + 1].type === 'ident'
    ) {
      knownClassNames.add(tokens[i + 1].value);
    }
    if (
      tokens[i].type === 'ident' &&
      (tokens[i].value === 'typename' || tokens[i].value === 'class') &&
      tokens[i + 1].type === 'ident'
    ) {
      knownClassNames.add(tokens[i + 1].value);
    }
  }

  const peek = (offset = 0): Token => tokens[Math.min(pos + offset, tokens.length - 1)];
  const next = (): Token => tokens[Math.min(pos++, tokens.length - 1)];
  const isAtEnd = (): boolean => peek().type === 'eof';

  const match = (type: TokenType, value?: string): boolean => {
    const t = peek();
    if (t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    pos++;
    return true;
  };

  const expect = (type: TokenType, value?: string, customMsg?: string): Token => {
    const t = peek();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new CppCompileError(
        customMsg ?? `Expected '${value ?? type}', got '${t.value || 'EOF'}'`,
        t.line,
        'syntax',
      );
    }
    pos++;
    return t;
  };

  const isTypeStartAt = (idx: number): boolean => {
    let cur = idx;
    while (cur < tokens.length && tokens[cur].type === 'ident' && CV_QUALIFIERS.has(tokens[cur].value)) {
      cur++;
    }
    const t = tokens[cur];
    if (!t || t.type !== 'ident') return false;
    if (t.value === 'struct' || t.value === 'class') return true;
    if (PRIMITIVE_TYPE_KEYWORDS.has(t.value)) return true;
    if (CONTAINER_TYPE_KEYWORDS.has(t.value)) return true;
    if (knownClassNames.has(t.value)) return true;
    return false;
  };

  const parseTypeInfo = (): CppTypeInfo => {
    while (peek().type === 'ident' && CV_QUALIFIERS.has(peek().value)) {
      next();
    }
    if (peek().type === 'ident' && (peek().value === 'struct' || peek().value === 'class')) {
      next();
    }

    const first = expect('ident', undefined, 'Expected a type name');
    let baseType = first.value;

    // Handle multi-word integer types like `long long`, `unsigned int`, `long int`
    while (
      peek().type === 'ident' &&
      (peek().value === 'long' || peek().value === 'int' || peek().value === 'short' || peek().value === 'char')
    ) {
      baseType += ' ' + next().value;
    }

    let templateArg: string | undefined;
    if (
      (CONTAINER_TYPE_KEYWORDS.has(first.value) || knownClassNames.has(first.value)) &&
      peek().type === 'op' &&
      peek().value === '<'
    ) {
      next(); // consume `<`
      let argStr = '';
      let depth = 1;
      while (!isAtEnd() && depth > 0) {
        const tk = next();
        if (tk.type === 'op' && tk.value === '<') {
          depth++;
          argStr += '<';
        } else if (tk.type === 'op' && tk.value === '>') {
          depth--;
          if (depth > 0) argStr += '>';
        } else if (tk.type === 'op' && tk.value === '>>') {
          depth -= 2;
          if (depth > 0) argStr += '>';
        } else {
          argStr += tk.value;
        }
      }
      templateArg = argStr.trim();
    }

    while (peek().type === 'ident' && CV_QUALIFIERS.has(peek().value)) {
      next();
    }

    let isPointer = false;
    let isReference = false;
    while (peek().type === 'op' && (peek().value === '*' || peek().value === '&')) {
      const op = next().value;
      if (op === '*') isPointer = true;
      if (op === '&') isReference = true;
    }

    return {
      baseType,
      templateArg,
      isPointer,
      isReference,
      isArray: false,
    };
  };

  // Lookahead helper: determines whether the tokens starting at `pos` are a declaration (var or func)
  const looksLikeDeclaration = (): boolean => {
    if (!isTypeStartAt(pos)) return false;
    const saved = pos;
    try {
      parseTypeInfo();
      const afterType = peek();
      if (afterType.type === 'ident') return true;
      // Structured binding `auto [k, v] : mp` — only when followed by `ident , ident ] :`
      if (
        afterType.type === 'punct' &&
        afterType.value === '[' &&
        tokens[pos + 1]?.type === 'ident' &&
        tokens[pos + 2]?.type === 'punct' &&
        tokens[pos + 2]?.value === ','
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      pos = saved;
    }
  };

  // Expression Parsing (Precedence Climbing)
  const parseExpression = (): CppExpr => parseAssignment();

  const parseAssignment = (): CppExpr => {
    const left = parseConditional();
    if (
      peek().type === 'op' &&
      ['=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>='].includes(peek().value)
    ) {
      const opTok = next();
      const right = parseAssignment();
      return {
        kind: 'AssignExpr',
        op: opTok.value,
        target: left,
        value: right,
        line: opTok.line,
      };
    }
    return left;
  };

  const parseConditional = (): CppExpr => {
    const expr = parseLogicalOr();
    if (match('punct', '?')) {
      const line = expr.line;
      const consequent = parseExpression();
      expect('punct', ':', "Expected ':' in ternary conditional expression");
      const alternate = parseConditional();
      return { kind: 'ConditionalExpr', test: expr, consequent, alternate, line };
    }
    return expr;
  };

  const parseLogicalOr = (): CppExpr => {
    let left = parseLogicalAnd();
    while (peek().type === 'op' && peek().value === '||') {
      const opTok = next();
      const right = parseLogicalAnd();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseLogicalAnd = (): CppExpr => {
    let left = parseBitwiseOr();
    while (peek().type === 'op' && peek().value === '&&') {
      const opTok = next();
      const right = parseBitwiseOr();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseBitwiseOr = (): CppExpr => {
    let left = parseBitwiseXor();
    while (peek().type === 'op' && peek().value === '|') {
      const opTok = next();
      const right = parseBitwiseXor();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseBitwiseXor = (): CppExpr => {
    let left = parseBitwiseAnd();
    while (peek().type === 'op' && peek().value === '^') {
      const opTok = next();
      const right = parseBitwiseAnd();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseBitwiseAnd = (): CppExpr => {
    let left = parseEquality();
    while (peek().type === 'op' && peek().value === '&') {
      const opTok = next();
      const right = parseEquality();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseEquality = (): CppExpr => {
    let left = parseRelational();
    while (peek().type === 'op' && (peek().value === '==' || peek().value === '!=')) {
      const opTok = next();
      const right = parseRelational();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseRelational = (): CppExpr => {
    let left = parseShift();
    while (
      peek().type === 'op' &&
      (peek().value === '<' || peek().value === '>' || peek().value === '<=' || peek().value === '>=')
    ) {
      const opTok = next();
      const right = parseShift();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseShift = (): CppExpr => {
    let left = parseAdditive();
    while (peek().type === 'op' && (peek().value === '<<' || peek().value === '>>')) {
      const opTok = next();
      const right = parseAdditive();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseAdditive = (): CppExpr => {
    let left = parseMultiplicative();
    while (peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const opTok = next();
      const right = parseMultiplicative();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseMultiplicative = (): CppExpr => {
    let left = parseUnary();
    while (peek().type === 'op' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const opTok = next();
      const right = parseUnary();
      left = { kind: 'BinaryExpr', op: opTok.value, left, right, line: opTok.line };
    }
    return left;
  };

  const parseUnary = (): CppExpr => {
    const t = peek();
    if (
      (t.type === 'op' && ['+', '-', '!', '++', '--', '*'].includes(t.value)) ||
      (t.type === 'punct' && t.value === '~')
    ) {
      const opTok = next();
      const expr = parseUnary();
      return { kind: 'UnaryExpr', op: opTok.value, expr, prefix: true, line: opTok.line };
    }

    if (t.type === 'ident' && t.value === 'sizeof') {
      const sizeofTok = next();
      expect('punct', '(', "Expected '(' after sizeof");
      if (isTypeStartAt(pos)) {
        const ti = parseTypeInfo();
        expect('punct', ')', "Expected ')' after sizeof(type)");
        return { kind: 'SizeofExpr', targetType: ti.baseType, line: sizeofTok.line };
      }
      const targetExpr = parseExpression();
      expect('punct', ')', "Expected ')' after sizeof expression");
      return { kind: 'SizeofExpr', targetExpr, line: sizeofTok.line };
    }

    if (t.type === 'ident' && t.value === 'new') {
      const newTok = next();
      const ti = parseTypeInfo();
      if (match('punct', '[')) {
        const sizeExpr = parseExpression();
        expect('punct', ']', "Expected ']' after array size in new[]");
        return {
          kind: 'NewExpr',
          className: ti.baseType,
          args: [],
          isArray: true,
          sizeExpr,
          line: newTok.line,
        };
      }
      const args: CppExpr[] = [];
      if (match('punct', '(')) {
        if (!match('punct', ')')) {
          do {
            args.push(parseExpression());
          } while (match('punct', ','));
          expect('punct', ')', "Expected ')' after constructor arguments");
        }
      } else if (match('punct', '{')) {
        if (!match('punct', '}')) {
          do {
            args.push(parseExpression());
          } while (match('punct', ','));
          expect('punct', '}', "Expected '}' after initializer arguments");
        }
      }
      return { kind: 'NewExpr', className: ti.baseType, args, line: newTok.line };
    }

    // C-style cast `(int)expr`
    if (t.type === 'punct' && t.value === '(' && isTypeStartAt(pos + 1)) {
      const saved = pos;
      try {
        next(); // `(`
        parseTypeInfo();
        if (match('punct', ')')) {
          return parseUnary();
        }
      } catch {
        // Fallback to parenthesized expression
      }
      pos = saved;
    }

    return parsePostfix();
  };

  const parsePostfix = (): CppExpr => {
    let expr = parsePrimary();

    for (; ;) {
      const t = peek();
      if (t.type === 'punct' && t.value === '[') {
        const bracketTok = next();
        const index = parseExpression();
        expect('punct', ']', "Expected ']' after array index");
        expr = { kind: 'IndexExpr', array: expr, index, line: bracketTok.line };
        continue;
      }
      if (t.type === 'punct' && t.value === '(') {
        const parenTok = next();
        const args: CppExpr[] = [];
        if (!match('punct', ')')) {
          do {
            args.push(parseExpression());
          } while (match('punct', ','));
          expect('punct', ')', "Expected ')' after function call arguments");
        }
        expr = { kind: 'CallExpr', callee: expr, args, line: parenTok.line };
        continue;
      }
      if ((t.type === 'punct' && t.value === '.') || (t.type === 'op' && t.value === '->')) {
        const accessTok = next();
        const memberTok = expect('ident', undefined, `Expected member name after '${accessTok.value}'`);
        expr = {
          kind: 'MemberExpr',
          object: expr,
          member: memberTok.value,
          isArrow: accessTok.value === '->',
          line: accessTok.line,
        };
        continue;
      }
      if (t.type === 'op' && (t.value === '++' || t.value === '--')) {
        const opTok = next();
        expr = { kind: 'UnaryExpr', op: opTok.value, expr, prefix: false, line: opTok.line };
        continue;
      }
      break;
    }

    return expr;
  };

  const parsePrimary = (): CppExpr => {
    const t = peek();

    if (t.type === 'number') {
      next();
      return { kind: 'NumberLit', value: Number(t.value), line: t.line };
    }

    if (t.type === 'string') {
      next();
      return { kind: 'StringLit', value: t.value, line: t.line };
    }

    if (t.type === 'char') {
      next();
      const code = t.value.length > 0 ? t.value.charCodeAt(0) : 0;
      return { kind: 'NumberLit', value: code, line: t.line };
    }

    if (t.type === 'punct' && t.value === '{') {
      const braceTok = next();
      const elements: CppExpr[] = [];
      if (!match('punct', '}')) {
        do {
          if (peek().type === 'punct' && peek().value === '}') break;
          elements.push(parseExpression());
        } while (match('punct', ','));
        expect('punct', '}', "Expected '}' to close initializer list");
      }
      return { kind: 'InitList', elements, line: braceTok.line };
    }

    if (t.type === 'punct' && t.value === '(') {
      next();
      const expr = parseExpression();
      expect('punct', ')', "Expected ')' after expression");
      return expr;
    }

    if (t.type === 'ident') {
      if (UNSUPPORTED_KEYWORDS.has(t.value)) {
        throw new CppCompileError(`C++ keyword '${t.value}' is not supported`, t.line, 'unsupported');
      }
      next();
      if (t.value === 'true' || t.value === 'false') {
        return { kind: 'BoolLit', value: t.value === 'true', line: t.line };
      }
      if (t.value === 'nullptr' || t.value === 'NULL') {
        return { kind: 'NullLit', line: t.line };
      }
      if (t.value === 'this') {
        return { kind: 'ThisExpr', line: t.line };
      }
      // Handle `static_cast<T>(expr)` and `const_cast<T>(expr)`
      if (t.value === 'static_cast' || t.value === 'const_cast') {
        expect('op', '<', `Expected '<' after ${t.value}`);
        parseTypeInfo();
        expect('op', '>', `Expected '>' after type in ${t.value}`);
        expect('punct', '(', `Expected '(' after ${t.value}<T>`);
        const inner = parseExpression();
        expect('punct', ')', `Expected ')' after ${t.value} expression`);
        return inner;
      }
      // Handle `INT_MAX`, `INT_MIN`, `LLONG_MAX`, `LLONG_MIN`, `SIZE_MAX`
      if (t.value === 'INT_MAX') {
        return { kind: 'NumberLit', value: 2147483647, line: t.line };
      }
      if (t.value === 'INT_MIN') {
        return { kind: 'NumberLit', value: -2147483648, line: t.line };
      }
      if (t.value === 'LLONG_MAX') {
        return { kind: 'NumberLit', value: 9007199254740991, line: t.line };
      }
      if (t.value === 'LLONG_MIN') {
        return { kind: 'NumberLit', value: -9007199254740991, line: t.line };
      }
      if (t.value === 'SIZE_MAX') {
        return { kind: 'NumberLit', value: 2147483647, line: t.line };
      }
      if (t.value in enumConstants) {
        return { kind: 'NumberLit', value: enumConstants[t.value], line: t.line };
      }
      return { kind: 'Ident', name: t.value, line: t.line };
    }

    throw new CppCompileError(
      `Unexpected token '${t.value || 'EOF'}' in expression`,
      t.line,
      'syntax',
    );
  };

  const parseVarDeclarationNoSemi = (baseTypeInfo: CppTypeInfo): VarDeclarator[] => {
    const declarations: VarDeclarator[] = [];

    do {
      let isPointer = baseTypeInfo.isPointer;
      let isReference = baseTypeInfo.isReference;
      if (declarations.length > 0) {
        isPointer = false;
        isReference = false;
        while (peek().type === 'op' && (peek().value === '*' || peek().value === '&')) {
          const op = next().value;
          if (op === '*') isPointer = true;
          if (op === '&') isReference = true;
        }
      }

      const nameTok = expect('ident', undefined, 'Expected variable name in declaration');
      let isArray = false;
      let arraySizeExpr: CppExpr | null = null;
      const arrayDims: CppExpr[] = [];

      while (match('punct', '[')) {
        isArray = true;
        if (!match('punct', ']')) {
          const dimExpr = parseExpression();
          if (arraySizeExpr === null) {
            arraySizeExpr = dimExpr;
          }
          arrayDims.push(dimExpr);
          expect('punct', ']', "Expected ']' in array declaration");
        }
      }

      let init: CppExpr | null = null;
      let ctorArgs: CppExpr[] | undefined;

      if (match('op', '=')) {
        init = parseExpression();
      } else if (peek().type === 'punct' && peek().value === '{') {
        init = parsePrimary();
      } else if (match('punct', '(')) {
        ctorArgs = [];
        if (!match('punct', ')')) {
          do {
            ctorArgs.push(parseExpression());
          } while (match('punct', ','));
          expect('punct', ')', "Expected ')' after constructor arguments");
        }
      }

      declarations.push({
        name: nameTok.value,
        typeInfo: {
          ...baseTypeInfo,
          isPointer,
          isReference,
          isArray,
          arraySizeExpr,
          arrayDims: arrayDims.length > 0 ? arrayDims : undefined,
        },
        init,
        ctorArgs,
        line: nameTok.line,
      });
    } while (match('punct', ','));

    return declarations;
  };

  const parseBlockStmt = (): CppStmt => {
    const openTok = expect('punct', '{', "Expected '{'");
    const body: CppStmt[] = [];
    while (!isAtEnd() && !(peek().type === 'punct' && peek().value === '}')) {
      body.push(parseStatement());
    }
    expect('punct', '}', "Expected '}' to close block");
    return { kind: 'BlockStmt', body, line: openTok.line };
  };

  const parseStatement = (): CppStmt => {
    const t = peek();

    if (t.type === 'punct' && t.value === ';') {
      next();
      return { kind: 'EmptyStmt', line: t.line };
    }

    if (t.type === 'punct' && t.value === '{') {
      return parseBlockStmt();
    }

    if (t.type === 'ident') {
      if (UNSUPPORTED_KEYWORDS.has(t.value)) {
        throw new CppCompileError(`C++ keyword '${t.value}' is not supported`, t.line, 'unsupported');
      }

      if (t.value === 'using') {
        next();
        if (peek().type === 'ident' && peek().value === 'namespace') {
          next();
          expect('ident', undefined, 'Expected namespace name after using namespace');
          expect('punct', ';', "Expected ';' after using namespace");
          return { kind: 'EmptyStmt', line: t.line };
        }
        throw new CppCompileError('Only "using namespace std;" is supported', t.line, 'unsupported');
      }

      if (t.value === 'if') {
        const ifTok = next();
        expect('punct', '(', "Expected '(' after 'if'");
        const test = parseExpression();
        expect('punct', ')', "Expected ')' after 'if' condition");
        const consequent = parseStatement();
        let alternate: CppStmt | null = null;
        if (peek().type === 'ident' && peek().value === 'else') {
          next();
          alternate = parseStatement();
        }
        return { kind: 'IfStmt', test, consequent, alternate, line: ifTok.line };
      }

      if (t.value === 'switch') {
        const swTok = next();
        expect('punct', '(', "Expected '(' after 'switch'");
        const discriminant = parseExpression();
        expect('punct', ')', "Expected ')' after 'switch' expression");
        expect('punct', '{', "Expected '{' in switch statement");
        const cases: SwitchCaseClause[] = [];
        while (!isAtEnd() && !(peek().type === 'punct' && peek().value === '}')) {
          const ct = peek();
          if (ct.type === 'ident' && ct.value === 'case') {
            const caseTok = next();
            const testExpr = parseExpression();
            expect('punct', ':', "Expected ':' after case value");
            const body: CppStmt[] = [];
            while (
              !isAtEnd() &&
              !(peek().type === 'punct' && peek().value === '}') &&
              !(peek().type === 'ident' && (peek().value === 'case' || peek().value === 'default'))
            ) {
              body.push(parseStatement());
            }
            cases.push({ test: testExpr, body, line: caseTok.line });
          } else if (ct.type === 'ident' && ct.value === 'default') {
            const defTok = next();
            expect('punct', ':', "Expected ':' after default");
            const body: CppStmt[] = [];
            while (
              !isAtEnd() &&
              !(peek().type === 'punct' && peek().value === '}') &&
              !(peek().type === 'ident' && (peek().value === 'case' || peek().value === 'default'))
            ) {
              body.push(parseStatement());
            }
            cases.push({ test: null, body, line: defTok.line });
          } else {
            throw new CppCompileError(`Expected 'case' or 'default' inside switch, got '${ct.value}'`, ct.line, 'syntax');
          }
        }
        expect('punct', '}', "Expected '}' to close switch statement");
        return { kind: 'SwitchStmt', discriminant, cases, line: swTok.line };
      }

      if (t.value === 'while') {
        const whileTok = next();
        expect('punct', '(', "Expected '(' after 'while'");
        const test = parseExpression();
        expect('punct', ')', "Expected ')' after 'while' condition");
        const body = parseStatement();
        return { kind: 'WhileStmt', test, body, line: whileTok.line };
      }

      if (t.value === 'do') {
        const doTok = next();
        const body = parseStatement();
        expect('ident', 'while', "Expected 'while' after 'do' body");
        expect('punct', '(', "Expected '(' after 'while'");
        const test = parseExpression();
        expect('punct', ')', "Expected ')' after 'do-while' condition");
        expect('punct', ';', "Expected ';' after 'do-while' statement");
        return { kind: 'DoWhileStmt', body, test, line: doTok.line };
      }

      if (t.value === 'for') {
        const forTok = next();
        expect('punct', '(', "Expected '(' after 'for'");

        // Check for range-based for loop: `for (int x : arr)` or `for (auto [k, v] : mp)`
        if (looksLikeDeclaration()) {
          const saved = pos;
          const ti = parseTypeInfo();
          if (peek().type === 'punct' && peek().value === '[') {
            next(); // `[`
            const kTok = expect('ident', undefined, 'Expected first binding identifier');
            expect('punct', ',', "Expected ',' in structured binding");
            const vTok = expect('ident', undefined, 'Expected second binding identifier');
            expect('punct', ']', "Expected ']' after structured binding");
            if (match('punct', ':')) {
              const iterable = parseExpression();
              expect('punct', ')', "Expected ')' after range-for expression");
              const body = parseStatement();
              return {
                kind: 'ForRangeStmt',
                varName: kTok.value,
                secondVarName: vTok.value,
                typeInfo: ti,
                iterable,
                body,
                line: forTok.line,
              };
            }
          } else if (peek().type === 'ident' && peek(1).type === 'punct' && peek(1).value === ':') {
            const varTok = next();
            next(); // consume `:`
            const iterable = parseExpression();
            expect('punct', ')', "Expected ')' after range-for expression");
            const body = parseStatement();
            return {
              kind: 'ForRangeStmt',
              varName: varTok.value,
              typeInfo: ti,
              iterable,
              body,
              line: forTok.line,
            };
          }
          pos = saved;
        }

        let init: CppStmt | null = null;
        if (!match('punct', ';')) {
          if (looksLikeDeclaration()) {
            const declLine = peek().line;
            const ti = parseTypeInfo();
            const declarations = parseVarDeclarationNoSemi(ti);
            expect('punct', ';', "Expected ';' after for-loop initializer");
            init = { kind: 'VarDeclStmt', declarations, line: declLine };
          } else {
            const expr = parseExpression();
            expect('punct', ';', "Expected ';' after for-loop initializer");
            init = { kind: 'ExprStmt', expr, line: expr.line };
          }
        }

        let test: CppExpr | null = null;
        if (!match('punct', ';')) {
          test = parseExpression();
          expect('punct', ';', "Expected ';' after for-loop condition");
        }

        let update: CppExpr | null = null;
        if (!match('punct', ')')) {
          update = parseExpression();
          expect('punct', ')', "Expected ')' after for-loop update");
        }

        const body = parseStatement();
        return { kind: 'ForStmt', init, test, update, body, line: forTok.line };
      }

      if (t.value === 'return') {
        const retTok = next();
        if (match('punct', ';')) {
          return { kind: 'ReturnStmt', value: null, line: retTok.line };
        }
        const value = parseExpression();
        expect('punct', ';', "Expected ';' after return statement");
        return { kind: 'ReturnStmt', value, line: retTok.line };
      }

      if (t.value === 'break') {
        const brkTok = next();
        expect('punct', ';', "Expected ';' after break");
        return { kind: 'BreakStmt', line: brkTok.line };
      }

      if (t.value === 'continue') {
        const contTok = next();
        expect('punct', ';', "Expected ';' after continue");
        return { kind: 'ContinueStmt', line: contTok.line };
      }

      if (t.value === 'delete') {
        const delTok = next();
        if (match('punct', '[')) {
          expect('punct', ']', "Expected ']' in delete[]");
        }
        const target = parseExpression();
        expect('punct', ';', "Expected ';' after delete statement");
        return { kind: 'DeleteStmt', target, line: delTok.line };
      }

      if (t.value === 'throw') {
        const thrTok = next();
        const expr = parseExpression();
        expect('punct', ';', "Expected ';' after throw statement");
        return { kind: 'ThrowStmt', expr, line: thrTok.line };
      }
    }

    if (looksLikeDeclaration()) {
      const declLine = peek().line;
      const ti = parseTypeInfo();
      const declarations = parseVarDeclarationNoSemi(ti);
      expect('punct', ';', "Expected ';' after variable declaration");
      return { kind: 'VarDeclStmt', declarations, line: declLine };
    }

    const expr = parseExpression();
    expect('punct', ';', "Expected ';' after statement");
    return { kind: 'ExprStmt', expr, line: expr.line };
  };

  const parseParamList = (): CppParam[] => {
    const params: CppParam[] = [];
    if (peek().type === 'punct' && peek().value === ')') {
      return params;
    }
    // Handle `(void)` parameter list
    if (
      peek().type === 'ident' &&
      peek().value === 'void' &&
      peek(1).type === 'punct' &&
      peek(1).value === ')'
    ) {
      next();
      return params;
    }

    do {
      const paramLine = peek().line;
      const ti = parseTypeInfo();
      let paramName = `arg${params.length}`;
      if (peek().type === 'ident') {
        paramName = next().value;
      }
      while (match('punct', '[')) {
        ti.isArray = true;
        if (!match('punct', ']')) {
          ti.arraySizeExpr = parseExpression();
          expect('punct', ']', "Expected ']' in array parameter");
        }
      }
      // Optional default parameter value `int x = 0`
      if (match('op', '=')) {
        parseExpression();
      }
      params.push({ name: paramName, typeInfo: ti, line: paramLine });
    } while (match('punct', ','));

    return params;
  };

  const classes: CppClassDecl[] = [];
  const functions: CppFuncDecl[] = [];
  const topLevelStatements: CppStmt[] = [];

  const parseEnumDecl = () => {
    expect('ident', 'enum');
    if (peek().type === 'ident' && (peek().value === 'class' || peek().value === 'struct')) {
      next();
    }
    if (peek().type === 'ident') {
      const enumName = next().value;
      knownClassNames.add(enumName);
    }
    expect('punct', '{', "Expected '{' in enum declaration");
    let nextVal = 0;
    while (!isAtEnd() && !(peek().type === 'punct' && peek().value === '}')) {
      const itemTok = expect('ident', undefined, 'Expected enum constant identifier');
      if (match('op', '=')) {
        const valExpr = parseExpression();
        if (valExpr.kind === 'NumberLit') {
          nextVal = valExpr.value;
        }
      }
      enumConstants[itemTok.value] = nextVal++;
      if (!match('punct', ',')) break;
    }
    expect('punct', '}', "Expected '}' to close enum declaration");
    match('punct', ';');
  };

  const consumeTemplatePrefix = () => {
    expect('ident', 'template');
    expect('op', '<', "Expected '<' after 'template'");
    let depth = 1;
    while (!isAtEnd() && depth > 0) {
      const tk = next();
      if (tk.type === 'op' && tk.value === '<') {
        depth++;
      } else if (tk.type === 'op' && tk.value === '>') {
        depth--;
      } else if (tk.type === 'op' && tk.value === '>>') {
        depth -= 2;
      } else if (
        tk.type === 'ident' &&
        (tk.value === 'typename' || tk.value === 'class') &&
        peek().type === 'ident'
      ) {
        knownClassNames.add(peek().value);
      }
    }
  };

  const parseClassOrStruct = (): CppClassDecl => {
    const kwTok = next(); // `struct` or `class`
    const nameTok = expect('ident', undefined, `Expected name after '${kwTok.value}'`);
    knownClassNames.add(nameTok.value);

    expect('punct', '{', `Expected '{' in ${kwTok.value} ${nameTok.value}`);

    const fields: CppFieldDecl[] = [];
    const constructors: CppConstructorDecl[] = [];
    const methods: CppFuncDecl[] = [];

    while (!isAtEnd() && !(peek().type === 'punct' && peek().value === '}')) {
      // Skip `public:`, `private:`, `protected:`
      if (
        peek().type === 'ident' &&
        (peek().value === 'public' || peek().value === 'private' || peek().value === 'protected')
      ) {
        next();
        expect('punct', ':', "Expected ':' after access specifier");
        continue;
      }

      if (peek().type === 'ident' && peek().value === 'template') {
        consumeTemplatePrefix();
      }

      // Nested `enum Foo { ... };`
      if (peek().type === 'ident' && peek().value === 'enum') {
        parseEnumDecl();
        continue;
      }

      // Nested `struct Node { ... };` or `class Node { ... };`
      if (
        peek().type === 'ident' &&
        (peek().value === 'struct' || peek().value === 'class') &&
        peek(1).type === 'ident' &&
        peek(2).type === 'punct' &&
        peek(2).value === '{'
      ) {
        const nestedCls = parseClassOrStruct();
        classes.push(nestedCls);
        continue;
      }

      // Destructor `~ClassName() { ... }`
      if (peek().type === 'punct' && peek().value === '~') {
        next();
        expect('ident');
        expect('punct', '(');
        expect('punct', ')');
        if (peek().type === 'punct' && peek().value === '{') {
          parseBlockStmt();
        } else {
          expect('punct', ';');
        }
        continue;
      }

      // Constructor `ClassName(...) : field(val) { ... }`
      if (
        peek().type === 'ident' &&
        peek().value === nameTok.value &&
        peek(1).type === 'punct' &&
        peek(1).value === '('
      ) {
        const ctorTok = next();
        expect('punct', '(');
        const params = parseParamList();
        expect('punct', ')', "Expected ')' after constructor parameters");

        const initializers: CppCtorInitializer[] = [];
        if (match('punct', ':')) {
          do {
            const fieldTok = expect('ident', undefined, 'Expected member name in initializer list');
            if (match('punct', '(')) {
              const expr = parseExpression();
              expect('punct', ')', "Expected ')' in member initializer");
              initializers.push({ field: fieldTok.value, expr });
            } else if (match('punct', '{')) {
              const expr = parseExpression();
              expect('punct', '}', "Expected '}' in member initializer");
              initializers.push({ field: fieldTok.value, expr });
            }
          } while (match('punct', ','));
        }

        const block = parseBlockStmt();
        constructors.push({
          params,
          initializers,
          body: block.kind === 'BlockStmt' ? block.body : [block],
          line: ctorTok.line,
        });
        continue;
      }

      // Member field or method
      const memberLine = peek().line;
      const ti = parseTypeInfo();
      const memberNameTok = expect('ident', undefined, 'Expected field or method name');

      // Method declaration
      if (match('punct', '(')) {
        const params = parseParamList();
        expect('punct', ')', "Expected ')' after method parameters");
        // Ignore trailing `const` on method
        if (peek().type === 'ident' && peek().value === 'const') {
          next();
        }
        const block = parseBlockStmt();
        methods.push({
          kind: 'FuncDecl',
          name: memberNameTok.value,
          returnType: ti,
          params,
          body: block.kind === 'BlockStmt' ? block.body : [block],
          line: memberLine,
        });
        continue;
      }

      // Field declaration (possibly comma-separated: `Node *left, *right;`)
      let firstFieldInit: CppExpr | null = null;
      let firstIsArray = false;
      let firstArraySize: CppExpr | null = null;
      const firstArrayDims: CppExpr[] = [];
      while (match('punct', '[')) {
        firstIsArray = true;
        if (!match('punct', ']')) {
          const dimExpr = parseExpression();
          if (firstArraySize === null) {
            firstArraySize = dimExpr;
          }
          firstArrayDims.push(dimExpr);
          expect('punct', ']');
        }
      }
      if (match('op', '=')) {
        firstFieldInit = parseExpression();
      }
      fields.push({
        name: memberNameTok.value,
        typeInfo: {
          ...ti,
          isArray: firstIsArray,
          arraySizeExpr: firstArraySize,
          arrayDims: firstArrayDims.length > 0 ? firstArrayDims : undefined,
        },
        defaultValue: firstFieldInit,
        line: memberLine,
      });

      while (match('punct', ',')) {
        let isPtr = false;
        let isRef = false;
        while (peek().type === 'op' && (peek().value === '*' || peek().value === '&')) {
          const op = next().value;
          if (op === '*') isPtr = true;
          if (op === '&') isRef = true;
        }
        const nextFieldTok = expect('ident', undefined, 'Expected field name after comma');
        let nextInit: CppExpr | null = null;
        if (match('op', '=')) {
          nextInit = parseExpression();
        }
        fields.push({
          name: nextFieldTok.value,
          typeInfo: { ...ti, isPointer: isPtr, isReference: isRef },
          defaultValue: nextInit,
          line: nextFieldTok.line,
        });
      }

      expect('punct', ';', "Expected ';' after member field declaration");
    }

    expect('punct', '}', `Expected '}' to close ${kwTok.value} ${nameTok.value}`);
    match('punct', ';'); // optional semicolon after class/struct definition

    return {
      kind: 'ClassDecl',
      name: nameTok.value,
      fields,
      constructors,
      methods,
      line: kwTok.line,
    };
  };

  while (!isAtEnd()) {
    const t = peek();

    if (t.type === 'ident' && UNSUPPORTED_KEYWORDS.has(t.value)) {
      throw new CppCompileError(`C++ keyword '${t.value}' is not supported`, t.line, 'unsupported');
    }

    if (t.type === 'ident' && t.value === 'template') {
      consumeTemplatePrefix();
      continue;
    }

    if (t.type === 'ident' && t.value === 'enum') {
      parseEnumDecl();
      continue;
    }

    // `using namespace std;`
    if (t.type === 'ident' && t.value === 'using') {
      parseStatement();
      continue;
    }

    // `struct Foo { ... };` or `class Foo { ... };`
    if (
      t.type === 'ident' &&
      (t.value === 'struct' || t.value === 'class') &&
      peek(1).type === 'ident' &&
      peek(2).type === 'punct' &&
      peek(2).value === '{'
    ) {
      classes.push(parseClassOrStruct());
      continue;
    }

    // Check if this is a function declaration or a top-level variable declaration
    if (looksLikeDeclaration()) {
      const saved = pos;
      const declLine = peek().line;
      const ti = parseTypeInfo();
      const nameTok = expect('ident');

      if (match('punct', '(')) {
        const params = parseParamList();
        expect('punct', ')', "Expected ')' after function parameters");
        // Forward prototype `void foo(int n);`
        if (match('punct', ';')) {
          continue;
        }
        const block = parseBlockStmt();
        functions.push({
          kind: 'FuncDecl',
          name: nameTok.value,
          returnType: ti,
          params,
          body: block.kind === 'BlockStmt' ? block.body : [block],
          line: declLine,
        });
        continue;
      }

      // Restore and parse as a top-level variable declaration statement
      pos = saved;
      topLevelStatements.push(parseStatement());
      continue;
    }

    topLevelStatements.push(parseStatement());
  }

  return { classes, functions, topLevelStatements, enums: enumConstants };
}

