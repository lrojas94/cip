/**
 * @fileOverview Inheritance tests
 */

// var sinon  = require('sinon');
var chai = require('chai');
// var sinon = require('sinon');
var assert = chai.assert;

// var noop = function(){};

var Inhe = require('../');



// The numbering (e.g. 1.1.1) has nothing to do with order
// The purpose is to provide a unique string so specific tests are
// run by using the mocha --grep "1.1.1" option.

suite('2.0 Constructor tests', function() {
  setup(function() {});
  teardown(function() {});

  test('2.0.1 Extending with a constructor', function(done) {
    Inhe.extend(function() {
      done();
    });
  });
  test('2.0.1.1 Can extend without a ctor', function(){
    assert.doesNotThrow(Inhe.extend);
  });
  test('2.0.2 extend() produces the expected static methods', function() {
    var Child = Inhe.extend();
    assert.isfunction(Child.extend, 'extend');
    assert.isfunction(Child.getInstance, 'getInstance');
    assert.isfunction(Child.mixin, 'mixin');
  });

  test('2.0.3 extend() singleton has a reference to the ctor prototype', function() {
    var child = Inhe.extend().getInstance();
    assert.instanceOf(child, Inhe);
  });

  test('2.0.6 ctor "this" defined properties are inherited', function() {
    var Child = Inhe.extend(function(){
      this.a = 1;
    });

    var GrandChild = Child.extend();
    var grandChild = new GrandChild();
    assert.property(grandChild, 'a');
    assert.equal(grandChild.a, 1);
  });

  test('2.0.7 ctor "this" defined properties have no side-effects', function() {
    var Child = Inhe.extend(function(){
      this.a = 1;
      this.obj = {
        b: 2,
      };
    });
    var child = Child.getInstance();
    child.a = 3;
    child.obj.b = 6;

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();
    assert.property(grandChild, 'a');
    assert.property(grandChild, 'obj');
    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.obj.b, 2);

    grandChild.a = 5;
    grandChild.obj.b = 9;
    assert.equal(child.a, 3);
    assert.equal(child.obj.b, 6);
  });

});

suite('2.1 Constructor arguments tests', function() {
  test('2.1.1 Constructors can accept arguments', function() {
    var Child = Inhe.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var child = new Child(1, 2);
    var childSingleton = Child.getInstance(3, 4);

    assert.equal(child.a, 1);
    assert.equal(child.b, 2);
    assert.equal(childSingleton.a, 3);
    assert.equal(childSingleton.b, 4);
  });
  test('2.1.2 Constructor arguments can be stubed by childs', function() {
    var Child = Inhe.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(5, 6, function(arg3) {
      this.c = arg3;
    });

    var grandChild = new GrandChild('lol');
    var grandChildSingleton = GrandChild.getInstance(0);

    assert.equal(grandChild.a, 5);
    assert.equal(grandChild.b, 6);
    assert.equal(grandChild.c, 'lol');
    assert.equal(grandChildSingleton.a, 5);
    assert.equal(grandChildSingleton.b, 6);
    assert.equal(grandChildSingleton.c, 0);
  });

  test('2.1.3 Constructor stubed arguments do not get confused with fn as args', function() {
    var Child = Inhe.extend(function(arg1, arg2) {
      this.a = arg1;
      this.b = arg2;
    });

    var GrandChild = Child.extend(function(){this.b++;}, 6, function(arg3) {
      this.c = arg3;
    });

    var grandChild = new GrandChild('lol');
    var grandChildSingleton = GrandChild.getInstance(0);

    assert.isFunction(grandChild.a);
    grandChild.a();
    assert.equal(grandChild.b, 7);
    assert.equal(grandChild.c, 'lol');
    assert.isFunction(grandChildSingleton.a);
    grandChildSingleton.a();
    grandChildSingleton.a();
    assert.equal(grandChildSingleton.b, 8);
    assert.equal(grandChildSingleton.c, 0);
  });

});

suite('2.2 Inheritance tests', function() {
  test('2.2.1 static methods are not inherited', function(){
    var Child = Inhe.extend();
    Child.astaticfn = function(){};

    var GrandChild = Child.extend();

    assert.notProperty(GrandChild, 'astaticfn');
  });
  test('2.2.2 prototype methods are inherited', function() {
    var Child = Inhe.extend();
    Child.prototype.add = function(a, b) { return a + b; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();

    assert.isFunction(grandChild.add);
    assert.equal(grandChild.add(1,1), 2);
  });

  test('2.2.3 getInstance returns the same instance', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });
    Child.prototype.add = function(a) { this.a += a; };

    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();
    grandChild.add(1);

    var grandChildCopy = GrandChild.getInstance();
    assert.equal(grandChildCopy.a, 2);
  });
  test('2.2.4 parent ctor is on "super_"', function() {
    var Child = Inhe.extend();
    var GrandChild = Child.extend();
    var grandChild = GrandChild.getInstance();

    assert.equal(grandChild.super_, Child);
    assert.equal(Child.getInstance().super_, Inhe);
  });

});

suite('2.3 Mixins tests', function() {
  test('2.3.1 Mixin ctor gets invoked', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend(function() {
      this.b = 2;
    });

    Child.mixin(ChildToMixin);

    var child = new Child();

    assert.equal(child.a, 1);
    assert.equal(child.b, 2);
  });
  test('2.3.2 Ctor passes the mixin', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend(function() {
      this.b = 2;
    });

    Child.mixin(ChildToMixin);

    var GrandChild = Child.extend(function() {
      this.c = 3;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
  });
  test('2.3.3 mixin accepts an array of ctors', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend(function() {this.b = 2;});
    var ChildToMixinTwo = Inhe.extend(function() {this.c = 3;});
    var ChildToMixinThree = Inhe.extend(function() {this.d = 4;});

    Child.mixin([ChildToMixin, ChildToMixinTwo, ChildToMixinThree]);

    var GrandChild = Child.extend(function() {
      this.e = 5;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
    assert.equal(grandChild.d, 4);
    assert.equal(grandChild.e, 5);
  });
  test('2.3.4 mixin accepts comma separated ctors', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend(function() {this.b = 2;});
    var ChildToMixinTwo = Inhe.extend(function() {this.c = 3;});
    var ChildToMixinThree = Inhe.extend(function() {this.d = 4;});

    Child.mixin(ChildToMixin, ChildToMixinTwo, ChildToMixinThree);

    var GrandChild = Child.extend(function() {
      this.e = 5;
    });

    var grandChild = new GrandChild();

    assert.equal(grandChild.a, 1);
    assert.equal(grandChild.b, 2);
    assert.equal(grandChild.c, 3);
    assert.equal(grandChild.d, 4);
    assert.equal(grandChild.e, 5);
  });
  test('2.3.5 Mixin can interact with the this object', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend(function() {
      this.a += 1;
    });

    Child.mixin(ChildToMixin);
    var child = new Child();
    assert.equal(child.a, 2);
  });


  test('2.3.10 Mixin prototype methods get passed down the chain', function() {
    var Child = Inhe.extend(function() {
      this.a = 1;
    });

    var ChildToMixin = Inhe.extend();
    ChildToMixin.prototype.add = function(a, b) {
      return a + b;
    };

    Child.mixin(ChildToMixin);

    var GrandChild = Child.extend(function() {
      this.c = 3;
    });

    var grandChild = new GrandChild();

    assert.isFunction(grandChild.add);
    assert.equal(grandChild.add(1, 1), 2);
  });

});
