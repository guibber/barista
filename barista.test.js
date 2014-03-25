describe('JsBarista', function() {

  describe('Maker', function() {
    it('make() creates anonymous object like new operator', function() {
      var ObjectDef = function(arg1) {
        return {arg1: arg1};
      };

      var expected = new ObjectDef(11);
      var actual = jsb.newMaker().make(ObjectDef, [11]);

      assert.equal(actual.arg1, expected.arg1);
      assert.equal(actual.prototype, expected.prototype);
    });

    it('make() creates standard object using this just like new operator', function() {
      var ObjectDef = function() {
        this.val1 = 11;
      };

      var expected = new ObjectDef(11);
      var actual = jsb.newMaker().make(ObjectDef, [11]);

      assert.equal(actual.arg1, expected.arg1);
      assert.equal(actual.prototype, expected.prototype);
    });

    it('make() creates externally set prototype object just like new operator', function() {
      var ObjectDef = function() {
        this.val1 = 11;
      };

      ObjectDef.prototype.getValue = function() {
        return this.val1++;
      };

      var expected = new ObjectDef(11);
      var actual = jsb.newMaker().make(ObjectDef, [11]);

      assert.equal(actual.arg1, expected.arg1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), expected.getValue());
    });

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

  describe('ConfigManager', function() {
    var defaultConfig = {iType: 'perdep'};
    it('get() returns default when undefined config', function() {
      assert.deepEqual(jsb.newConfigManager().get('name'), defaultConfig);
    });

    it('get() returns default when empty config', function() {
      assert.deepEqual(jsb.newConfigManager({}).get('name'), defaultConfig);
    });

    it('get() returns default when one config name not found', function() {
      assert.deepEqual(jsb.newConfigManager({Name: 'config'}).get('NotThere'), defaultConfig);
    });

    it('get() returns config one config and exists', function() {
      assert.deepEqual(jsb.newConfigManager({Name: 'config'}).get('Name'), 'config');
    });

    it('get() returns matching config of many', function() {
      assert.deepEqual(jsb.newConfigManager({
        Name: 'configName',
        Place: 'configPlace',
        Thing: 'configThing'
      }).get('Place'), 'configPlace');
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
      configMgr = jsb.newConfigManager();
      mockConfigMgr = sandbox.mock(configMgr);
      builder = jsb.newNamespaceBuilder(cashier, configMgr);
    });

    afterEach(function() {
      mockCashier.verify();
      mockConfigMgr.verify();
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

    it('build() with one object added returns namespace instance per', function() {
      var prop = jsb.newProperty('Name', function() {
      });
      mockConfigMgr.expects('get').withExactArgs(prop.name).once().returns({iType: 'perdep'});
      mockCashier.expects("orderCoffee").withExactArgs(prop.implementation).once().returns('jsb1');

      builder.add(prop);

      assert.deepEqual(builder.build(), {
        Name: 'jsb1'
      });
    });

    it('build() with one object added with static config returns static', function() {
      var prop = jsb.newProperty('Name', function() {
      });
      mockConfigMgr.expects('get').withExactArgs(prop.name).once().returns({iType: 'static'});
      mockCashier.expects("orderSharedCoffee").withExactArgs(prop.implementation).once().returns('jsb1');

      builder.add(prop);

      assert.deepEqual(builder.build(), {
        Name: 'jsb1'
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

      mockConfigMgr.expects('get').withExactArgs(prop3.name).once().returns({iType: 'perdep'});
      mockCashier.expects("orderCoffee").withExactArgs(prop3.implementation).once().returns('jsb3-1');
      mockConfigMgr.expects('get').withExactArgs(prop4.name).once().returns({iType: 'perdep'});
      mockCashier.expects("orderCoffee").withExactArgs(prop4.implementation).once().returns('jsb4-1');

      builder.add(prop1);
      builder.add(prop2);
      builder.add(prop3);
      builder.add(prop4);

      assert.deepEqual(builder.build(), {
        val1: prop1.implementation,
        function2: prop2.implementation,
        Obj3: 'jsb3-1',
        Obj4: 'jsb4-1'
      });
    });

    it('build() with multiple objects and non objects static and instance per returns configured namespace', function() {
      var prop1 = jsb.newProperty('val1', 1),
          prop2 = jsb.newProperty('function2', function() {
          }),
          prop3 = jsb.newProperty('Obj3', function() {
          }),
          prop4 = jsb.newProperty('Obj4', function() {
          });

      mockConfigMgr.expects('get').withExactArgs(prop3.name).once().returns({iType: 'perdep'});
      mockCashier.expects("orderCoffee").withExactArgs(prop3.implementation).once().returns('jsb3-1');
      mockConfigMgr.expects('get').withExactArgs(prop4.name).once().returns({iType: 'static'});
      mockCashier.expects("orderSharedCoffee").withExactArgs(prop4.implementation).once().returns('jsb4-1');

      builder.add(prop1);
      builder.add(prop2);
      builder.add(prop3);
      builder.add(prop4);

      assert.deepEqual(builder.build(), {
        val1: prop1.implementation,
        function2: prop2.implementation,
        Obj3: 'jsb3-1',
        Obj4: 'jsb4-1'
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
          servedNs = jsb.serve(new ns('depends'), {ObjDef2: {iType: 'static'}}),
          obj1Instance1 = servedNs.ObjDef1(1),
          obj1Instance2 = servedNs.ObjDef1(2),
          obj2Ref1 = servedNs.ObjDef2(3),
          obj2Ref2 = servedNs.ObjDef2(4);

      assert.propertyVal(servedNs, 'prop1', 'depends');
      assert.equal(obj1Instance1.getParam(), 1);
      assert.equal(obj1Instance2.getParam(), 2);
      assert.equal(obj2Ref1.getParam(), 3);
      assert.equal(obj2Ref2.getParam(), 3);
      assert.equal(obj2Ref1, obj2Ref2);
    });
  });
});