var assert = require('assert')
const fs = require('fs-extra')
var path = require('path')
const {diff} = require('deep-diff')
var compiler = require('../src/index.js');
var base = 'test/fixtures'
var compileFixtures = path.join(base, 'compile')

describe('resource-policy-compiler -> compile policy', function () {

  function execJSONCompare(policy, target, done) {
    var result = compiler.compile(policy)
    assert.equal(undefined, diff(result, fs.readJSONSync(path.join(compileFixtures, target))))
    done()
  }
  /***
  激活状态
  */
  it('missing activated states', function (done) {
    var policy = `
            for public  :
    `;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, 'missing activated states')
    done()
  })
  /***
  初始状态
  */
  it('must have initial state', function (done) {
    var policy = `
            for public  :
              in active:
                terminate`;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, 'line 3: mismatched input \'active\' expecting {\'initial\', \'<initial>\', \'init\', \'<init>\'}')
    done()
  })
  /***
  下一状态
  */
  it('expecting proceed to or terminate', function (done) {
    var policy = `
            for public  :
              in initial:
    `;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, 'line 4: mismatched input \'<EOF>\' expecting {\'proceed to\', TERMINATE}')
    done()
  })
  /***
  终止状态
  */
  it('terminate state', function (done) {
    var policy = `
            for public  :
              in <initial>:
                terminate
    `;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, null)
    done()
  })

  /***
  用户组-user
  */
  it('test user group', function (done) {
    var policy = `
    for group_user_5a9f8b22ad98f000220a0317 :
      in <initial> :
        terminate
    `;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, null)
    done()
  })
  /***
  用户组-node
  */
  it('test node group', function (done) {
    var policy = `
    for group_node_5a9f8b22ad98f000220a0317 :
      in <initial> :
        terminate
    `;
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, null)
    done()
  })
  /***
  多个policy-segment
  */
  it('compile multi policy', function (done) {
    var policy = `
      for public :
        in initial :
          proceed to <signing> on receiving transaction of 100 to feth233dbc32069
        in <signing> :
          proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ce
        for public, user@freelog.com :
          in initial :
            proceed to <A> on receiving transaction of 1999 to feth233dbc32081
          in <A> :
            proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ba
            in <B> :
            proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ba
        for 13712345678 :
          in initial :
            proceed to <A> on receiving transaction of 1999 to feth233dbc32081
          in <A> :
            proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ba
      `
    var result = compiler.compile(policy)
    assert.equal(result.errorMsg, null)
    done()
  })
  /***
  用户-电话和伊妹儿
  */
  it('test mobile phone or email', function (done) {
    var policy = `
      for user@freelog.com,13788888888 :
        in initial :
          proceed to <signing> on receiving transaction of 100 to feth233dbc32069
       for 13712345678 :
            in initial :
              proceed to <A> on receiving transaction of 1999 to feth233dbc32081
      `
    execJSONCompare(policy, 'email_phone.json', done)
  })
  /***
  事件-时间单位
  */
  it('test time unit', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  after 1 cycle of contract creation
                proceed to <active>  after 2 cycles of contract creation
                proceed to <active>  after 3 years of contract creation
    `;
    // fs.writeFileSync(path.join(compileFixtures, 'time_unit.json'), JSON.stringify(compiler.compile(policy)))
    execJSONCompare(policy, 'time_unit.json', done)
  })
  /***
  事件-多个states
  */
  it('multi states', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on receiving transaction of 1999 to feth233dbc32081
              in <active>:
              proceed to <activeA>  on accepting license e759419923ea25bf6dff2694391a1e65c21739ba
    `;
    execJSONCompare(policy, 'multi_states.json', done)
  })

  /***
  事件-复合事件
  */
  it('compound Events', function (done) {
    var policy = `
            for public  :
              in initial:
                proceed to <active>  on receiving transaction of 1999 to feth233dbc32081 and on accepting license e759419923ea25bf6dff2694391a1e65c21739ba
    `;
    execJSONCompare(policy, 'compoundEvents.json', done)
  })
  /***
  事件- 余额大于
  */
  it('balance_event greater', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on account_balance greater than 8888
    `;
    execJSONCompare(policy, 'balance_event.json', done)
  })
  /***
  事件- 余额小于
  */
  it('balance_smaller_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on account_balance smaller than 1000
    `;
    execJSONCompare(policy, 'balance_smaller_event.json', done)
  })

  /***
  事件- 周期事件
  */
  it('period_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on end of cycle
    `;
    execJSONCompare(policy, 'period_event.json', done)
  })
  /***
  事件- 支付事件
  */
  it('transaction_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on receiving transaction of 100 to feth233dbc32069
    `;
    execJSONCompare(policy, 'transaction_event.json', done)
  })
  /***
  事件- 签署许可
  */
  it('signing_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on accepting license e759419923ea25bf6dff2694391a1e65c21739ce,e759419923ea25bf6dff2694391a1e65c21739ce
    `;
    var result = compiler.compile(policy)
    execJSONCompare(policy, 'signing_event.json', done)
  })
  /***
  事件- 特定日期
  */
  it('specific_date_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  at 2018-08-08 12:20
    `;
    execJSONCompare(policy, 'specific_date_event.json', done)
  })
  /***
  事件- 相对日期
  */
  it('relative_date_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  after 1 cycle of contract creation
    `;
    execJSONCompare(policy, 'relative_date_event.json', done)
  })

  /***
  事件-访问增量
  */
  it('visit_increment_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on visit_increment of 10000
    `;

    execJSONCompare(policy, 'visit_increment_event.json', done)
  })
  /***
  事件-访问量
  */
  it('visit_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active>  on visit of 1000
    `;
    execJSONCompare(policy, 'visit_event.json', done)
  })
  /***
  事件-合同保证金
  */
  it('contract_guaranty_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active> on contract_guaranty of 1000 refund after 1 year
    `;
    execJSONCompare(policy, 'contract_guaranty_event.json', done)
  })
  /***
  事件-平台保证金
  */
  it('platform_guaranty_event', function (done) {
    var policy = `
            for public  :
              in <initial>:
                proceed to <active> on receiving platform_guaranty of 1000
    `;
    execJSONCompare(policy, 'platform_guaranty_event.json', done)
  })
});
