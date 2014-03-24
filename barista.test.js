describe('JsBarista', function() {

  describe('Maker', function() {
    it('make() creates anonymous object like new operator', function() {
      var ObjectDef = function(arg1) {
        return {arg1: arg1};
      };

      var actual = jsb.newMaker().make(ObjectDef, [11]);

      assert.equal(actual.arg1, 11);
      assert.equal(actual.prototype, ObjectDef.prototype);
    });

    //    it('make() creates standard object like new operator', function() {
    //      var ObjectDef = function() {
    //        this.val1 = 11;
    //      };
    //      console.log(ObjectDef);
    //      var expected = new ObjectDef(11);
    //      console.log(expected);
    //      var actual = jsb.newMaker().make(ObjectDef, [11]);
    //      
    //      expect(actual.arg1).to.equal(expected.arg1);
    //      expect(actual.prototype).to.equal(expected.prototype);
    //    });
  });

  describe('Property', function() {
    it('name and implmentation properties set', function() {
      var ObjectDef = function(arg1) {
        return {arg1: arg1};
      };

      var property = jsb.newProperty('name', ObjectDef);

      assert.equal(property.name, 'name');
      assert.equal(property.implementation, ObjectDef);
    });

    it('isObject() returns true for functions starting with capital letter', function() {
      var ObjectDef = function() {
      };
      assert.isTrue(jsb.newProperty('Name', ObjectDef).isObject());
    });

    it('isObject() returns false for functions starting with lowercase letter', function() {
      var ObjectDef = function() {
      };
      assert.isFalse(jsb.newProperty('name', ObjectDef).isObject());
    });

    it('isObject() returns false for all other types', function() {
      var bool = true;
      var number = 1;
      var str = 'string';
      var date = new Date();
      var obj = {};

      assert.isFalse(jsb.newProperty('X', bool).isObject());
      assert.isFalse(jsb.newProperty('X', number).isObject());
      assert.isFalse(jsb.newProperty('X', str).isObject());
      assert.isFalse(jsb.newProperty('X', date).isObject());
      assert.isFalse(jsb.newProperty('X', obj).isObject());
      assert.isFalse(jsb.newProperty('X', null).isObject());
      assert.isFalse(jsb.newProperty('X').isObject());
    });
  });

  describe('PropertyExtractor', function() {
    it('extract() calls newPropFunc with args and returns property', function() {
      var ns = function(param) {
        var prop1 = 1,
            prop2 = 2,
            prop3 = 3;

        return {
          prop1: prop1,
          prop2: prop2,
          prop3: prop3
        };
      };

      var extractor = jsb.newPropertyExtractor(ns, jsb.newProperty);

      assert.equal(extractor.extract('prop1').name, 'prop1');
      assert.equal(extractor.extract('prop2').name, 'prop2');
      assert.equal(extractor.extract('prop3').name, 'prop3');
    });
  });

  describe('Cashier', function() {
    var sandbox,
        maker,
        cashier;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      maker = jsb.newMaker();
      mockMaker = sandbox.mock(maker);
      cashier = jsb.newCashier(maker);
    });

    afterEach(function() {
      mockMaker.verify();
      sandbox.restore();
    });

    it('orderCoffee() returns func, executing it calls maker and returns coffee', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('coffee');

      var coffee = cashier.orderCoffee('obj')('arg1', 'arg2', 'arg3');
      assert.equal(coffee, 'coffee');
    });

    it('orderSharedCoffee() returns func, executing it multiple times calls maker only once and always returns coffee', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('coffee');

      var func = cashier.orderSharedCoffee('obj');
      var coffee = func('arg1', 'arg2', 'arg3');
      var coffee2 = func('argOther');
      assert.equal(coffee, 'coffee');
      assert.equal(coffee, coffee2);
    });

  });

  describe('NamespaceBuilder', function() {
    var sandbox,
        cashier,
        mockCashier,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      cashier = jsb.newCashier();
      mockCashier = sandbox.mock(cashier);
      builder = jsb.newNamespaceBuilder(cashier);
    });

    afterEach(function() {
      mockCashier.verify();
      sandbox.restore();
    });

    it('build() with zero adds returns empty namespace', function() {
      assert.deepEqual(builder.build(), {});
    });

    it('build() with one added non-object returns namespace with prop', function() {
      var implementation = 'impl',
          prop = jsb.newProperty('impl', implementation);

      builder.add(prop);
      assert.deepEqual(builder.build(), {
        impl: implementation
      });
    });

    it('build() with one object added returns namespace with N, S, and O', function() {
      var prop = jsb.newProperty('Impl', function() {
      });
      mockCashier.expects("orderCoffee").withExactArgs(prop.implementation).once().returns(1);
      mockCashier.expects("orderSharedCoffee").withExactArgs(prop.implementation).once().returns(2);

      builder.add(prop);

      assert.deepEqual(builder.build(), {
        Nbar_Impl: 1,
        Sbar_Impl: 2,
        Impl: 1
      });
    });

    it('build() with multiple objects and non objects added returns configured namespace', function() {
      var prop1 = jsb.newProperty('val1', 1),
          prop2 = jsb.newProperty('function2', function() {
          }),
          prop3 = jsb.newProperty('Obj3', function() {
          }),
          prop4 = jsb.newProperty('Obj4', function() {
          });
      mockCashier.expects("orderCoffee").withExactArgs(prop3.implementation).once().returns('prop3-1');
      mockCashier.expects("orderSharedCoffee").withExactArgs(prop3.implementation).once().returns('prop3-2');
      mockCashier.expects("orderCoffee").withExactArgs(prop4.implementation).once().returns('prop4-1');
      mockCashier.expects("orderSharedCoffee").withExactArgs(prop4.implementation).once().returns('prop4-2');

      builder.add(prop1);
      builder.add(prop2);
      builder.add(prop3);
      builder.add(prop4);

      assert.deepEqual(builder.build(), {
        val1: prop1.implementation,
        function2: prop2.implementation,
        Nbar_Obj3: 'prop3-1',
        Sbar_Obj3: 'prop3-2',
        Obj3: 'prop3-1',
        Nbar_Obj4: 'prop4-1',
        Sbar_Obj4: 'prop4-2',
        Obj4: 'prop4-1'
      });
    });

  });

  describe('Barista', function() {
    var sandbox,
        builder,
        mockBuilder,
        extractor,
        mockExtractor,
        barista;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      builder = jsb.newNamespaceBuilder();
      mockBuilder = sandbox.mock(builder);
      extractor = jsb.newPropertyExtractor();
      mockExtractor = sandbox.mock(extractor);
      barista = jsb.newBarista(extractor, builder);
    });

    afterEach(function() {
      mockExtractor.verify();
      mockBuilder.verify();
      sandbox.restore();
    });

    it('serve() with zero properites returns namespace', function() {
      mockBuilder.expects('build').once().returns('namespace');
      assert.equal(barista.serve({}), 'namespace');
    });

    it('serve() with one properity adds to namespace', function() {
      mockExtractor.expects('extract').withExactArgs('prop1').once().returns('extracted1');
      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(barista.serve({
        prop1: 1
      }), 'namespace');
    });

    it('serve() with many properities adds to namespace', function() {
      mockExtractor.expects('extract').withExactArgs('prop1').once().returns('extracted1');
      mockExtractor.expects('extract').withExactArgs('prop2').once().returns('extracted2');
      mockExtractor.expects('extract').withExactArgs('prop3').once().returns('extracted3');

      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('add').withExactArgs('extracted2').once();
      mockBuilder.expects('add').withExactArgs('extracted3').once();

      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(barista.serve({
        prop1: 1,
        prop2: 2,
        prop3: 3
      }), 'namespace');
    });
  });

  describe('namespace serve()', function() {
    it('returns namespace with properties and functions, and 3 Objects', function() {
      var ns = function() {
        var x = 11;

        function xyz() {
        }

        function ObjDef() {
          function getX() {
            return x;
          }
          return {getX: getX};
        }
        return {
          x: x,
          xyz: xyz,
          ObjDef: ObjDef
        };
      },
          actual = jsb.serve(new ns());

      assert.propertyVal(actual, 'x', ns.x);
      assert.propertyVal(actual, 'xyz', ns.xyz);
      assert.property(actual, 'Nbar_ObjDef');
      assert.property(actual, 'Sbar_ObjDef');
      assert.equal(actual.ObjDef, actual.Nbar_ObjDef);
    });

    it('calls modFunc to make mods on namespace', function() {
      var actual = jsb.serve({}, function(ns) {
        ns.adjusted = true;
      });
      assert.propertyVal(actual, 'adjusted', true);
    });

    it('using baristafied namespace', function() {
      var ns = function(dependency) {
        var prop1 = dependency;

        function ObjDef1(param) {
          function getParam() {
            return param;
          }
          return {getParam: getParam};
        }

        function ObjDef2(param) {
          function getParam() {
            return param;
          }
          return {getParam: getParam};
        }

        return {
          prop1: prop1,
          ObjDef1: ObjDef1,
          ObjDef2: ObjDef2
        };
      },
          actual = jsb.serve(new ns('depends'), function(ns) {
            ns.ObjDef2 = ns.Sbar_ObjDef2;
          }),
          obj1Instance1 = actual.ObjDef1(1),
          obj1Instance2 = actual.ObjDef1(2),
          obj2Ref1 = actual.ObjDef2(3),
          obj2Ref2 = actual.ObjDef2(4);

      assert.propertyVal(actual, 'prop1', 'depends');
      assert.equal(obj1Instance1.getParam(), 1);
      assert.equal(obj1Instance2.getParam(), 2);
      assert.equal(obj2Ref1.getParam(), 3);
      assert.equal(obj2Ref2.getParam(), 3);
      assert.equal(obj2Ref1, obj2Ref2);
    });
  });
});