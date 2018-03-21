const {presentablePolicyListener} = require('@freelog/presentable-policy-lang');
const ACTIVE_REG = /^<.+>$/

class JSONGeneratorExtentionClass extends presentablePolicyListener {

  constructor() {
    super();
    this.errorMsg = null;
    this.policy_segments = [];
  }

  enterPolicy(ctx) {
  }

  exitPolicy(ctx) {
  }

  formatSegmentBlock() {
    let segment_block = this._segment_block
    var users = {};
    segment_block.users.forEach((info) => {
      users[info.userType] = users[info.userType] || {userType: info.userType, users: []}
      users[info.userType].users.push(info.user)
    })

    segment_block.users = Object.values(users)
    segment_block.all_occured_states = Array.from(segment_block.all_occured_states);
    segment_block.activatedStates = segment_block.all_occured_states.filter((state) => {
      if (ACTIVE_REG.test(state)) {
        return state;
      }
    });
  }

  enterSegment(ctx) {
    var originalInput = ctx.start.getInputStream().strdata
    var segmentText = originalInput.slice(ctx.start.start, ctx.stop.stop + 1)
    segmentText = segmentText.replace(/[ \t\r\n]+/g, ' ')
    this._segment_block = {
      segmentText: segmentText,
      initialState: '',
      terminateState: 'terminate',
      users: [],
      states: [], //from state
      all_occured_states: new Set(),
      state_transition_table: [],
      activatedStates: []
    }
  }

  exitSegment(ctx) {
    let segment_block = this._segment_block

    this.formatSegmentBlock()
    if (!segment_block.activatedStates.length) {
      this.errorMsg = 'missing activated states'
    }

    this.policy_segments.push(segment_block);
    //临时变量
    delete this._segment_block
    delete this._events
    delete this._current_state
  }

  enterUsers(ctx) {
    let segment_block = this._segment_block
    //校验规则跟后台保持一致
    const EMAIL_REG = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
    const PHONE_REG = /^1[34578]\d{9}$/
    let user = ctx.getText();
    let isEmail = EMAIL_REG.test(user);
    let isPhone = PHONE_REG.test(user);
    let isSelf = /self/.test(user.toLowerCase());
    if (isEmail || isPhone || isSelf) {
      segment_block.users.push({userType: 'individual', user: user})
    } else {
      segment_block.users.push({userType: 'group', user: user})
    }
  }

  enterCurrent_state_clause(ctx) {
    let segment_block = this._segment_block
    let state = ctx.ID().getText()
    this._current_state = state;
    segment_block.states.push(state);
    segment_block.all_occured_states.add(state);
  }

  enterInitial_state_clause(ctx) {
    let segment_block = this._segment_block
    var state = ctx.children[1].getText();

    segment_block.initialState = state
    this._current_state = state
    segment_block.states.push(state);
    segment_block.all_occured_states.add(state);
  }

  enterTarget_clause(ctx) {
    let segment_block = this._segment_block

    if (ctx.getText().toLowerCase() !== 'terminate') {
      ctx.next_state = ctx.ID().getText();
      segment_block.all_occured_states.add(ctx.next_state);
    }
    //重置event
    this._events = []
  }

  exitTarget_clause(ctx) {
    let segment_block = this._segment_block
    let state_transition = {
      currentState: this._current_state
    };

    if (ctx.next_state) {
      state_transition.nextState = ctx.next_state
    }
    if (this._events.length) {
      state_transition.event = (this._events.length > 1) ? {
        type: 'compoundEvents',
        params: this._events
      } : this._events[0];
    }
    segment_block.state_transition_table.push(state_transition);
  }

  enterPeriod_event(ctx) {
    let timeUnit = ctx.TIMEUNIT().getText();
    this._events.push({
      type: 'period',
      params: [timeUnit],
      eventName: ['period', timeUnit, 'event'].join('_')
    });
  }

  enterSpecific_date_event(ctx) {
    let date = ctx.DATE().getText();
    let hour = ctx.HOUR().getText();

    this._events.push({
      type: 'arrivalDate',
      params: [1, `${date} ${hour}`],
      eventName: ['arrivalDate_1', date, 'event'].join('_')
    });
  }

  enterRelative_date_event(ctx) {
    let day = Number(ctx.INTEGER_NUMBER().getText());
    let unit = ctx.TIMEUNIT().getText();

    unit = unit.replace(/s$/, '')
    this._events.push({
      type: 'arrivalDate',
      params: [0, day, unit],
      eventName: ['arrivalDate_0', day, unit, 'event'].join('_')
    });
  }

  enterPricing_agreement_event(ctx) {
    this._events.push({
      type: 'pricingAgreement',
      params: [],
      eventName: 'pricingAgreement'
    });
  }

  enterTransaction_event(ctx) {
    let transactionAmount = Number(ctx.INTEGER_NUMBER().getText());
    let account_id = ctx.FEATHERACCOUNT().getText();

    let REG = /^f[0-9A-Za-z]{14}$/;
    if (!REG.test(account_id)) {
      return this.errorMsg = 'FEATHERACCOUNT not valid.'
    }
    this._events.push({
      type: 'transaction',
      params: [account_id, transactionAmount],
      eventName: ['transaction', account_id, transactionAmount, 'event'].join('_')
    });
  }

  enterSigning_event(ctx) {
    var flag = true;
    let tempLicenseIds = ctx.license_resource_id().map((licensId) => {
      let result = licensId.getText();
      if (!/^[a-z0-9A-Z]{40}$/.test(result)) {
        flag = false;
      }
      return licensId.getText()
    })
    if (!flag) {
      return this.errorMsg = 'license id not valid'
    }
    this._events.push({
      type: 'signing',
      params: tempLicenseIds,
      eventName: 'signing_' + tempLicenseIds.join('_')
    });
  }

  enterContract_guaranty(ctx) {
    let amount = ctx.INTEGER_NUMBER()[0].getText();
    let day = ctx.INTEGER_NUMBER()[1].getText();
    this._events.push({
      type: 'contractGuaranty',
      params: [amount, day, 'day'],
      eventName: ['contractGuaranty', amount, day, 'event'].join('_')
    });
  }

  enterPlatform_guaranty(ctx) {
    this._events.push({
      type: 'platformGuaranty',
      params: [Number(ctx.INTEGER_NUMBER().getText())],
      eventName: 'platformGuaranty'
    });
  }

  enterSettlement_event(ctx) {
    this._events.push({
      type: 'accountSettled',
      params: []
    });
  }

  enterVisit_increment_event(ctx) {
    this._events.push({
      type: 'accessCountIncrement',
      params: [Number(ctx.INTEGER_NUMBER().getText())]
    });
  }

  enterVisit_event(ctx) {
    this._events.push({
      type: 'accessCount',
      params: [Number(ctx.INTEGER_NUMBER().getText())]
    });
  }

  enterBalance_greater(ctx) {
    this._events.push({type: 'balance_greater_event', params: ctx.INTEGER_NUMBER().getText()});
  }

  enterBalance_smaller(ctx) {
    this._events.push({type: 'balance_smaller_event', params: ctx.INTEGER_NUMBER().getText()});
  }
}

module.exports = JSONGeneratorExtentionClass;
