var compiler = require('./src/index.js');
var string1=
`For  group_node_abc:
  in initial :  proceed to <signing> on transaction of 100 to feth1026f01634a
  in <signing>:
    proceed to activate on accepting license license_A`;

var string2 =
`for test@qq.com, nodes:
  in initial :
    proceed to signing on transaction of 200 to feth209fa4da1a4
  in signing:
    proceed to <activate> on license license_A`;

   console.log('start gen');
  //  var re = compiler.compile(string1, 'beautify');
   // console.log(re);
  //  var str = re.stringArray.join(' ').replace(/\n\s/g,'\n');
  //  console.log(str);
   var re2 = compiler.compile(string2);
   console.log(re2);
   // console.log(re2.policy_segments[0].users);
   // console.log(re2.policy_segments[0].state_transition_table);
  //  console.log(JSON.stringify(re2.policy_segments[0].state_transition_table));

    console.log(compiler.compile(string2, 'beautify').stringArray.splice(1).join(' ').replace(/\n\s/g,'\n'));
