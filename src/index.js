const {
  InputStream,
  CommonTokenStream,
} = require('antlr4/index');
const {presentablePolicyLexer, presentablePolicyParser} = require('@freelog/presentable-policy-lang');
const {ParseTreeWalker} = require('antlr4/tree');
const ErrorListener = require('antlr4/error/ErrorListener').ConsoleErrorListener;
const ErrorListenerExtend = require('./ErrorListenerExtend');
ErrorListenerExtend(ErrorListener.prototype);

var compile = function (text, target = 'json') {
  let Listener = require('./JSONGeneratorExtension.js');
  if (target === 'beautify') {
    Listener = require('./BeautifyExtension.js');
  } else {
    Listener = require('./JSONGeneratorExtension.js');
  }

  let chars = new InputStream(text);
  let lexer = new presentablePolicyLexer(chars);
  let tokens = new CommonTokenStream(lexer);
  let parser = new presentablePolicyParser(tokens);
  parser.buildParseTrees = true;
  let tree = parser.policy();

  let listener = new Listener();
  const walker = new ParseTreeWalker();
  walker.walk(listener, tree);
  // antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
  if (parser._listeners[0].errorMsg) {
    //把错误信息放进listener里面
    listener.errorMsg = parser._listeners[0].errorMsg;
    parser._listeners[0].errorMsg = null
  }
  return listener;
};

exports.compile = compile;
