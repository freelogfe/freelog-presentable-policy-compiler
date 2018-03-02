var assert = require('assert')
const fs = require('fs-extra')
var path = require('path')
var compiler = require('../src/index.js');
var base = 'test/fixtures'

describe('resource-policy-compiler -> beautify policy', function () {

  function readSync(path) {
    return fs.readFileSync(path, 'utf8')
  }


  it('beautify single policy', function (done) {
    var policy = `
            for public  :
                in initial :
                proceed to      <pending> on accepting license e759419923ea25bf6dff2694391a1e65c21739ce
              in <pending> :
                       proceed to   pendingtwo on end of cycle
              in pendingtwo :
                proceed to <pending> on receiving transaction of 100 to feth233dbc320699
    `;

    var result = compiler.beautify(policy)
    assert.equal(result, readSync(path.join(base, 'beautify')))
    done()
  })

  it('beautify terminate policy', function (done) {
    var policy = `
            for public  :
              in <initial>:
               TERMINATE
    `;

    var result = compiler.beautify(policy)
    assert.equal(result, readSync(path.join(base, 'terminate-beautify')))
    done()
  })

  it('beautify multi policies', function (done) {
    var policy = `
for public :
  in initial :
    proceed to <signing> on receiving transaction of 100 to feth233dbc32069
  in <signing> :
    proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ce
    for public :
      in initial :
        proceed to <signing> on receiving transaction of 100 to feth233dbc32069
      in <signing> :
        proceed to activate on accepting license e759419923ea25bf6dff2694391a1e65c21739ce
`

    var result = compiler.beautify(policy)
    assert.equal(result, readSync(path.join(base, 'multi-beautify')))
    done()
  })
});