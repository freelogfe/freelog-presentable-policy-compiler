var compiler = require('./src/index.js');
var string1=
`For  group_node_abc:
  in initial :  proceed to signing on transaction of 100 to feth1026f01634a
  in signing:
    proceed to activate on accepting license license_A`;

var string2 =
`for aaa-1-1, group_NODE_assv, group_user_assbv :
  in initial :
    terminate`;

   console.log('start gen');
  //  var re = compiler.compile(string1, 'beautify');
   // console.log(re);
  //  var str = re.stringArray.join(' ').replace(/\n\s/g,'\n');
  //  console.log(str);
   var re2 = compiler.compile(string2);
   // console.log(re2);
   // console.log(re2.policy_segments[0].users);
   // console.log(re2.policy_segments[0].state_transition_table);
  //  console.log(JSON.stringify(re2.policy_segments[0].state_transition_table));

    console.log(compiler.compile(string2, 'beautify').stringArray.splice(1).join(' ').replace(/\n\s/g,'\n'));
