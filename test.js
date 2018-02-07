var compiler = require('./src/index.js');
var string1=
`for  self:
  in initial :
    proceed to <activate> on accepting license e759419923ea25bf6dff2694391a1e65c21739ce
  in <activate> :
    proceed to pendingpayment on end of cycle
  in pendingpayment :
      proceed to <activate> on transaction of 100 to feth233dbc32069
`;

var string2 =
`for public:
in initial:
proceed to <good> on accepting license e759419923ea25bf6dff2694391a1e65c21739ce`

var str3 =
`for public :
  in initial :
    proceed to <signing> on transaction of 100 to feth233dbc32069
  in <signing> :
    proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ce`
   console.log('start gen');
  //  var re = compiler.compile(string1, 'beautify');
   // console.log(re);
  //  var str = re.stringArray.join(' ').replace(/\n\s/g,'\n');
  //  console.log(str);
   var re2 = compiler.compile(string1);
   console.log(re2);
   console.log(re2.policy_segments[0].users);
   console.log(re2.policy_segments[0].state_transition_table);
   // console.log(JSON.stringify(re2.policy_segments[0].state_transition_table));

    // console.log(compiler.compile(str3, 'beautify').stringArray.splice(1).join(' ').replace(/\n\s/g,'\n'));
