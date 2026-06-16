const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== 'build' && file !== '.expo' && file !== 'web-build' && file !== 'dist') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const errors = [];

  function getLineAndChar(pos) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    return { line: line + 1, character: character + 1 };
  }

  function isHookName(name) {
    return /^use[A-Z0-9]/.test(name);
  }

  let functionStack = [];

  function visit(node) {
    const isFunction = ts.isFunctionDeclaration(node) || 
                       ts.isFunctionExpression(node) || 
                       ts.isArrowFunction(node) || 
                       ts.isMethodDeclaration(node);

    if (isFunction) {
      let name = '';
      if (node.name) {
        name = node.name.text;
      } else if (node.parent && ts.isVariableDeclaration(node.parent) && node.parent.name) {
        name = node.parent.name.text;
      }
      
      const isComponent = name && (/^[A-Z]/.test(name) || isHookName(name));
      
      functionStack.push({
        name: name || '<anonymous>',
        isComponentOrHook: isComponent,
        topLevelReturns: [],
        controlFlowDepth: 0,
        isInNestedFunction: functionStack.length > 0
      });
    }

    const isControlFlow = ts.isIfStatement(node) || 
                          ts.isIterationStatement(node) || 
                          ts.isSwitchStatement(node) || 
                          ts.isTryStatement(node) ||
                          ts.isConditionalExpression(node) ||
                          (ts.isBinaryExpression(node) && 
                           (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || 
                            node.operatorToken.kind === ts.SyntaxKind.BarBarToken || 
                            node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken));

    const currentFunc = functionStack[functionStack.length - 1];

    if (currentFunc && isControlFlow) {
      currentFunc.controlFlowDepth++;
    }

    if (ts.isCallExpression(node)) {
      let hookName = '';
      if (ts.isIdentifier(node.expression)) {
        hookName = node.expression.text;
      } else if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name)) {
        hookName = node.expression.name.text;
      }

      if (isHookName(hookName)) {
        if (!currentFunc) {
          const { line } = getLineAndChar(node.getStart());
          errors.push({ line, msg: `Hook "${hookName}" chamado fora de qualquer componente ou hook customizado.` });
        } else {
          const { line } = getLineAndChar(node.getStart());
          
          if (!currentFunc.isComponentOrHook) {
            if (currentFunc.isInNestedFunction) {
              errors.push({ line, msg: `Hook "${hookName}" chamado dentro de uma função aninhada "${currentFunc.name}".` });
            } else {
              errors.push({ line, msg: `Hook "${hookName}" chamado na função "${currentFunc.name}" que não é um componente nem hook customizado.` });
            }
          }
          
          if (currentFunc.controlFlowDepth > 0) {
            errors.push({ line, msg: `Hook "${hookName}" chamado condicionalmente ou dentro de fluxo de controle (if, loop, switch, try/catch, etc.).` });
          }

          if (currentFunc.topLevelReturns.length > 0) {
            errors.push({ line, msg: `Hook "${hookName}" chamado após um return statement (linhas do return: ${currentFunc.topLevelReturns.join(', ')}).` });
          }
        }
      }
    }

    if (ts.isReturnStatement(node) && currentFunc) {
      const { line } = getLineAndChar(node.getStart());
      currentFunc.topLevelReturns.push(line);
    }

    ts.forEachChild(node, visit);

    if (currentFunc && isControlFlow) {
      currentFunc.controlFlowDepth--;
    }

    if (isFunction) {
      functionStack.pop();
    }
  }

  visit(sourceFile);
  return errors;
}

const targetDir = path.resolve(__dirname, '../artifacts/techlearn');
const files = getAllFiles(targetDir);
console.log(`Verificando ${files.length} arquivos em ${targetDir}...\n`);

let problemCount = 0;
files.sort().forEach(file => {
  const relPath = path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/');
  const errors = checkFile(file);
  if (errors.length === 0) {
    console.log(`${relPath}\n✓ aprovado\n`);
  } else {
    problemCount += errors.length;
    console.log(`${relPath}\n⚠ problema encontrado`);
    errors.forEach(err => {
      console.log(`  [Linha ${err.line}] ${err.msg}`);
    });
    console.log();
  }
});

console.log(`Fim da auditoria. Total de problemas encontrados: ${problemCount}`);
process.exit(problemCount > 0 ? 1 : 0);
