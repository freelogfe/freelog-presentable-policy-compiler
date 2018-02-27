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

var compile = function compile(text) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'json';

  var Listener = require('./JSONGeneratorExtension.js');
  if (target === 'beautify') {
    Listener = require('./BeautifyExtension.js');
  } else {
    Listener = require('./JSONGeneratorExtension.js');
  }

  var chars = new InputStream(text);
  var lexer = new presentablePolicyLexer(chars);
  var tokens = new CommonTokenStream(lexer);
  var parser = new presentablePolicyParser(tokens);
  parser.buildParseTrees = true;
  var tree = parser.policy();

  var listener = new Listener();
  var walker = new ParseTreeWalker();
  walker.walk(listener, tree);
  // antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
  if (parser._listeners[0].errorMsg) {
    //把错误信息放进listener里面
    listener.errorMsg = parser._listeners[0].errorMsg;
    parser._listeners[0].errorMsg = null;
  }
  return listener;
};

exports.compile = compile;