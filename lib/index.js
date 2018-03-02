'use strict';

var _require = require('antlr4/index'),
    InputStream = _require.InputStream,
    CommonTokenStream = _require.CommonTokenStream;

var _require2 = require('@freelog/presentable-policy-lang'),
    presentablePolicyLexer = _require2.presentablePolicyLexer,
    presentablePolicyParser = _require2.presentablePolicyParser;

var _require3 = require('antlr4/tree'),
    ParseTreeWalker = _require3.ParseTreeWalker;

var ErrorListener = require('antlr4/error/ErrorListener').ConsoleErrorListener;
var ErrorListenerExtend = require('./ErrorListenerExtend');
ErrorListenerExtend(ErrorListener.prototype);

function parse(text, Listener) {
  var chars = new InputStream(text);
  var lexer = new presentablePolicyLexer(chars);
  var tokens = new CommonTokenStream(lexer);
  var parser = new presentablePolicyParser(tokens);
  parser.buildParseTrees = true;
  var tree = parser.policy();
  var listener = new Listener();
  var walker = new ParseTreeWalker();
  walker.walk(listener, tree);
  if (parser._listeners[0].errorMsg) {
    listener.errorMsg = parser._listeners[0].errorMsg;
    parser._listeners[0].errorMsg = null;
  }

  return listener;
}

function compile(text) {
  var Listener = void 0;
  Listener = require('./JSONGeneratoListener.js');
  return parse(text, Listener);
}

function beautify(text) {
  var Listener = require('./BeautifyListener.js');
  var listener = parse(text, Listener);
  return listener.stringArray.join(' ').replace(/\n\s/g, '\n');
}

exports.beautify = beautify;
exports.compile = compile;