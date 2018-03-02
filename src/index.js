const {
  InputStream,
  CommonTokenStream,
} = require('antlr4/index');
const {presentablePolicyLexer, presentablePolicyParser} = require('@freelog/presentable-policy-lang');
const {ParseTreeWalker} = require('antlr4/tree');
const ErrorListener = require('antlr4/error/ErrorListener').ConsoleErrorListener;
const ErrorListenerExtend = require('./ErrorListenerExtend');
ErrorListenerExtend(ErrorListener.prototype);

function parse(text, Listener) {
  let chars = new InputStream(text);
  let lexer = new presentablePolicyLexer(chars);
  let tokens = new CommonTokenStream(lexer);
  let parser = new presentablePolicyParser(tokens);
  parser.buildParseTrees = true;
  const tree = parser.policy();
  let listener = new Listener();
  const walker = new ParseTreeWalker();
  walker.walk(listener, tree);
  if (parser._listeners[0].errorMsg) {
    listener.errorMsg = parser._listeners[0].errorMsg;
    parser._listeners[0].errorMsg = null
  }

  return listener;
}

function compile(text) {
  let Listener;
  Listener = require('./JSONGeneratoListener.js');
  return parse(text, Listener)
}

function beautify(text) {
  var Listener = require('./BeautifyListener.js');
  var listener = parse(text, Listener)
  return listener.stringArray.join(' ').replace(/\n\s/g, '\n')
}


exports.beautify = beautify
exports.compile = compile;

