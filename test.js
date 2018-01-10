var compiler = require('./lib/index.js');
var string1=
`For 0x12@123.com34, 0x432com, 0x432m and users in LoginUser, RegisteredUser:
  in initial :  proceed to signing on accepting transaction of 100 to feth1026f01634a
  in signing:
    proceed to activate on accepting license license_A
  I agree to authorize token in activate`;

var string2 =
`For 0x12@123.com34 :
    in initial :
      proceed to activate on accepting transaction of 100 to feth1026f01634a
    in activate :
      proceed to suspend on accepting lincese LicenseA
        I agree to authorize token in activate`

var string3 =
'This contract shall commence with effect from 2017-12-12 03:30 and shall continue until 2017-12-21 03:30 unless terminated earlier in accordance with its terms and conditions'+
'For userA:'+
  'in begining:proceed to suspend on accepting license license_A '+
  'in activate: proceed to suspend on visit_increment of 1 '+
  'in suspend : proceed to activate on account_settled';
var  string4 =
'This contract shall commence with effect from 12-12-2012  03:30 and shall continue until 11-11-2012 03:30 unless terminated earlier in accordance with its terms and conditions'+
'For userA:'+
   'in begining:proceed to activate on accepting license license_A and price priceExpression '+
   'in activate: proceed to suspend on visit of 200 '+
   'in suspend : proceed to activate on account_settled';

var  string5 =
'This contract shall commence with effect from 12-12-2012 03:30 and shall continue until 2012-12-13 03:30 unless terminated earlier in accordance with its terms and conditions'+
'For users in groupA:'+
   'in begining:proceed to pending_payment on accepting license license_A '+
   'in pending_payment : proceed to activate on transaction of 300 to owner'

var string6 =
'This contract shall commencith effect from 12-12-2012 03:03 and shall continue until 12-13-2012 unless terminated earlier in accordance with its terms and conditions'+
'For free_log_A and users in user_groups_A:'+
   'in initial:proceed to activate on accepting price priceExpression and  license license_A '+
   'in activate: proceed to settlement on the end of year '+
                'proceed to suspend on account_balance greater than 100000 '+
   'in settlement: proceed to activate on account_settled '+
   'in suspend : proceed to activate on account_balance smaller than 100000';


var str7 = `For testUser@test.com and users in LoginUser in the following states:
    in initial :
      proceed to activatetwo on accepting license licenseA , licenseB and on contract_guaranty of 5000 refund after 1 day
    in activatetwo :
      proceed to activate on date 2012-12-12
    in activate :
      proceed to activatetwo on the end of day
    in activatetwo :
      proceed to activate on 10 day after contract creation
    I agree to authorize token in begining , activate`;

    var str8 = 'For testUser in the following states:\
    in initial :\
      proceed to activatetwo on accepting license licenseA , licenseB\
        proceed to activatetwo on accepting license licenseA , licenseB\
    I agree to authorize token in '
   console.log('start gen');
  //  var re = compiler.compile(string1, 'beautify');
   // console.log(re);
  //  var str = re.stringArray.join(' ').replace(/\n\s/g,'\n');
  //  console.log(str);
   var re2 = compiler.compile(string2);
   console.log(re2);
   // console.log(re2);
   console.log(re2.policy_segments[0].users);
  //  console.log(re2.policy_segments[0].state_transition_table);
  //  console.log(JSON.stringify(re2.policy_segments[0].state_transition_table));

    console.log(compiler.compile(string2, 'beautify').stringArray.splice(1).join(' ').replace(/\n\s/g,'\n'));
