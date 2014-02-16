/*jshint unused:false */
/*jshint camelcase:false */
/**
 * @fileOverview Wrapping tests
 */
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var Cip = require('../');

suite('Wrap tests', function() {
  var TypicalCtor;
  setup(function(){
    TypicalCtor = function () {
      this.a = 1;
      this.ron = null;
      this.s = 'zztop';
    };
    TypicalCtor.prototype.add = function() {
      return ++this.a;
    };

  });

  test('Wrap adds all Cip props and methods', function() {
    var CipTypicalCtor = Cip.wrap(TypicalCtor);
    assert.ok(Cip.is(CipTypicalCtor));
    assert.isFunction(CipTypicalCtor.extend, 'CipTypicalCtor should have an "extend" static method');
    assert.isFunction(CipTypicalCtor.extendSingleton, 'CipTypicalCtor should have a "extendSingleton" static method');
    assert.notProperty(CipTypicalCtor, 'wrap', 'CipTypicalCtor should *not* have a "wrap" static method');
    assert.notProperty(CipTypicalCtor, 'is', 'CipTypicalCtor should *not* have a "is" static method');
  });
  test('extending wrapped constructors retains instanceof', function() {
    var CipTypicalCtor = Cip.wrap(TypicalCtor);
    var Child = CipTypicalCtor.extend();

    var child = new Child();
    assert.instanceOf(child, TypicalCtor);
  });
  test('Wrapping constructors does not mutate original Ctor', function() {
    var CipTypicalCtor = Cip.wrap(TypicalCtor);
    var Child = CipTypicalCtor.extend();

    assert.notProperty(TypicalCtor, 'extend');
    assert.notOk(Cip.is(TypicalCtor));
  });
});
