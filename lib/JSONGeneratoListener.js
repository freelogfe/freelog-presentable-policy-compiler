'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('@freelog/presentable-policy-lang'),
    presentablePolicyListener = _require.presentablePolicyListener;

var ACTIVE_REG = /^<.+>$/;

var JSONGeneratorExtentionClass = function (_presentablePolicyLis) {
  _inherits(JSONGeneratorExtentionClass, _presentablePolicyLis);

  function JSONGeneratorExtentionClass() {
    _classCallCheck(this, JSONGeneratorExtentionClass);

    var _this = _possibleConstructorReturn(this, (JSONGeneratorExtentionClass.__proto__ || Object.getPrototypeOf(JSONGeneratorExtentionClass)).call(this));

    _this.errorMsg = null;
    _this.policy_segments = [];
    return _this;
  }

  _createClass(JSONGeneratorExtentionClass, [{
    key: 'enterPolicy',
    value: function enterPolicy(ctx) {}
  }, {
    key: 'exitPolicy',
    value: function exitPolicy(ctx) {}
  }, {
    key: 'formatSegmentBlock',
    value: function formatSegmentBlock() {
      var segment_block = this._segment_block;
      var users = {};
      segment_block.users.forEach(function (info) {
        users[info.userType] = users[info.userType] || { userType: info.userType, users: [] };
        users[info.userType].users.push(info.user);
      });

      segment_block.users = Object.values(users);
      segment_block.all_occured_states = Array.from(segment_block.all_occured_states);
      segment_block.activatedStates = segment_block.all_occured_states.filter(function (state) {
        if (ACTIVE_REG.test(state)) {
          return state;
        }
      });
    }
  }, {
    key: 'enterSegment',
    value: function enterSegment(ctx) {
      var originalInput = ctx.start.getInputStream().strdata;
      var segmentText = originalInput.slice(ctx.start.start, ctx.stop.stop + 1);
      segmentText = segmentText.replace(/[ \t\r\n]+/g, ' ');
      this._segment_block = {
        segmentText: segmentText,
        initialState: '',
        terminateState: 'terminate',
        users: [],
        states: [], //from state
        all_occured_states: new Set(),
        state_transition_table: [],
        activatedStates: []
      };
    }
  }, {
    key: 'exitSegment',
    value: function exitSegment(ctx) {
      var segment_block = this._segment_block;

      this.formatSegmentBlock();
      if (!segment_block.activatedStates.length) {
        this.errorMsg = 'missing activated states';
      }

      this.policy_segments.push(segment_block);
      //临时变量
      delete this._segment_block;
      delete this._events;
      delete this._current_state;
    }
  }, {
    key: 'enterUsers',
    value: function enterUsers(ctx) {
      var segment_block = this._segment_block;
      //校验规则跟后台保持一致
      var EMAIL_REG = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      var PHONE_REG = /^1[34578]\d{9}$/;
      var user = ctx.getText();
      var isEmail = EMAIL_REG.test(user);
      var isPhone = PHONE_REG.test(user);
      var isSelf = /self/.test(user.toLowerCase());
      if (isEmail || isPhone || isSelf) {
        segment_block.users.push({ userType: 'individual', user: user });
      } else {
        segment_block.users.push({ userType: 'group', user: user });
      }
    }
  }, {
    key: 'enterCurrent_state_clause',
    value: function enterCurrent_state_clause(ctx) {
      var segment_block = this._segment_block;
      var state = ctx.ID().getText();
      this._current_state = state;
      segment_block.states.push(state);
      segment_block.all_occured_states.add(state);
    }
  }, {
    key: 'enterInitial_state_clause',
    value: function enterInitial_state_clause(ctx) {
      var segment_block = this._segment_block;
      var state = ctx.children[1].getText();

      segment_block.initialState = state;
      this._current_state = state;
      segment_block.states.push(state);
      segment_block.all_occured_states.add(state);
    }
  }, {
    key: 'enterTarget_clause',
    value: function enterTarget_clause(ctx) {
      var segment_block = this._segment_block;

      if (ctx.getText().toLowerCase() !== 'terminate') {
        ctx.next_state = ctx.ID().getText();
        segment_block.all_occured_states.add(ctx.next_state);
      }
      //重置event
      this._events = [];
    }
  }, {
    key: 'exitTarget_clause',
    value: function exitTarget_clause(ctx) {
      var segment_block = this._segment_block;
      var state_transition = {
        currentState: this._current_state,
        nextState: ctx.next_state
      };

      if (this._events.length > 1) {
        state_transition.event = {
          type: 'compoundEvents',
          params: this._events
        };
      } else {
        state_transition.event = this._events[0];
      }
      segment_block.state_transition_table.push(state_transition);
    }
  }, {
    key: 'enterPeriod_event',
    value: function enterPeriod_event(ctx) {
      var timeUnit = ctx.TIMEUNIT().getText();
      this._events.push({
        type: 'period',
        params: [timeUnit],
        eventName: ['period', timeUnit, 'event'].join('_')
      });
    }
  }, {
    key: 'enterSpecific_date_event',
    value: function enterSpecific_date_event(ctx) {
      var date = ctx.DATE().getText();
      var hour = ctx.HOUR().getText();

      this._events.push({
        type: 'arrivalDate',
        params: [1, date + ' ' + hour],
        eventName: ['arrivalDate_1', date, 'event'].join('_')
      });
    }
  }, {
    key: 'enterRelative_date_event',
    value: function enterRelative_date_event(ctx) {
      var day = Number(ctx.INTEGER_NUMBER().getText());
      var unit = ctx.TIMEUNIT().getText();

      unit = unit.replace(/s$/, '');
      this._events.push({
        type: 'arrivalDate',
        params: [0, day, unit],
        eventName: ['arrivalDate_0', day, unit, 'event'].join('_')
      });
    }
  }, {
    key: 'enterPricing_agreement_event',
    value: function enterPricing_agreement_event(ctx) {
      this._events.push({
        type: 'pricingAgreement',
        params: [],
        eventName: 'pricingAgreement'
      });
    }
  }, {
    key: 'enterTransaction_event',
    value: function enterTransaction_event(ctx) {
      var transactionAmount = Number(ctx.INTEGER_NUMBER().getText());
      var account_id = ctx.FEATHERACCOUNT().getText();

      this._events.push({
        type: 'transaction',
        params: [account_id, transactionAmount],
        eventName: ['transaction', account_id, transactionAmount, 'event'].join('_')
      });
    }
  }, {
    key: 'enterSigning_event',
    value: function enterSigning_event(ctx) {
      var tempLicenseIds = ctx.license_resource_id().map(function (licensId) {
        return licensId.getText();
      });

      this._events.push({
        type: 'signing',
        params: tempLicenseIds,
        eventName: 'signing_' + tempLicenseIds.join('_')
      });
    }
  }, {
    key: 'enterContract_guaranty',
    value: function enterContract_guaranty(ctx) {
      var amount = ctx.INTEGER_NUMBER()[0].getText();
      var day = ctx.INTEGER_NUMBER()[1].getText();
      this._events.push({
        type: 'contractGuaranty',
        params: [amount, day, 'day'],
        eventName: ['contractGuaranty', amount, day, 'event'].join('_')
      });
    }
  }, {
    key: 'enterPlatform_guaranty',
    value: function enterPlatform_guaranty(ctx) {
      this._events.push({
        type: 'platformGuaranty',
        params: [Number(ctx.INTEGER_NUMBER().getText())],
        eventName: 'platformGuaranty'
      });
    }
  }, {
    key: 'enterSettlement_event',
    value: function enterSettlement_event(ctx) {
      this._events.push({
        type: 'accountSettled',
        params: []
      });
    }
  }, {
    key: 'enterVisit_increment_event',
    value: function enterVisit_increment_event(ctx) {
      this._events.push({
        type: 'accessCountIncrement',
        params: [Number(ctx.INTEGER_NUMBER().getText())]
      });
    }
  }, {
    key: 'enterVisit_event',
    value: function enterVisit_event(ctx) {
      this._events.push({
        type: 'accessCount',
        params: [Number(ctx.INTEGER_NUMBER().getText())]
      });
    }
  }, {
    key: 'enterBalance_greater',
    value: function enterBalance_greater(ctx) {
      this._events.push({ type: 'balance_greater_event', params: ctx.INTEGER_NUMBER().getText() });
    }
  }, {
    key: 'enterBalance_smaller',
    value: function enterBalance_smaller(ctx) {
      this._events.push({ type: 'balance_smaller_event', params: ctx.INTEGER_NUMBER().getText() });
    }
  }]);

  return JSONGeneratorExtentionClass;
}(presentablePolicyListener);

module.exports = JSONGeneratorExtentionClass;