describe('Barista', function() {
  describe('ConfigDefaulter', function() {
    var defaultConfig = {
      type: barista.perdependency,
      name: '_default',
      params: []
    };

    it('setRegistrationDefaults() does nothing when zero registrations', function() {
      assert.deepEqual(new barista.ConfigDefaulter().setRegistrationDefaults([]), []);
    });

    it('setRegistrationDefaults() with one registration adds type and name and params if undefined', function() {
      assert.deepEqual(new barista.ConfigDefaulter().setRegistrationDefaults([{}]), [defaultConfig]);
    });

    it('setRegistrationDefaults() with one registration adds type or name and params if undefined', function() {
      assert.deepEqual(new barista.ConfigDefaulter().setRegistrationDefaults([{type: barista.perdependency}]), [defaultConfig]);
      assert.deepEqual(new barista.ConfigDefaulter().setRegistrationDefaults([{name: '_default'}]), [defaultConfig]);
    });

    it('setRegistrationDefaults() with many registrations adds type and name if undefined', function() {
      assert.deepEqual(new barista.ConfigDefaulter().setRegistrationDefaults([{}, {}, {}]), [defaultConfig, defaultConfig, defaultConfig]);
    });
  });

  describe('ConfigManager', function() {
    var sandbox,
        defaulter,
        mockDefaulter;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      defaulter = new barista.ConfigDefaulter();
      mockDefaulter = sandbox.mock(defaulter);

    });

    afterEach(function() {
      mockDefaulter.verify();
      sandbox.restore();
    });

    it('getRegistrations() returns defaulted registration when null config', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, null, defaulter).getRegistrations('name'), 'config');
    });

    it('getRegistrations() returns defaulted registration when empty config', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, {}, defaulter).getRegistrations('name'), 'config');
    });

    it('getRegistrations() returns default registration when one non-matching config', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, {Name: {}}, defaulter).getRegistrations('nothere'), 'config');
    });

    it('getRegistrations() returns matching registration in array when one matching config without array', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{v: 1}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, {Name: {v: 1}}, defaulter).getRegistrations('Name'), 'config');
    });

    it('getRegistrations() returns matching registration when one matching config and already in array', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{v: 1}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, {Name: [{v: 1}]}, defaulter).getRegistrations('Name'), 'config');
    });

    it('getRegistrations() returns matching registration when many configs', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{x: 'configPlace'}])
        .returns('config');

      assert.deepEqual(new barista.ConfigManager(null, {
        Name: 'configName',
        Place: [{x: 'configPlace'}],
        Thing: 'configThing'
      }, defaulter).getRegistrations('Place'), 'config');
    });

    it('getNsName() returns nsName param', function() {
      assert.equal(new barista.ConfigManager('nsName', 'config', null).getNsName(), 'nsName');
    });
  });

  describe('Property', function() {
    it('name and implmentation properties set', function() {
      var ObjectDef = function(arg1) {
        return {arg1: arg1};
      };

      var property = new barista.Property('name', ObjectDef);

      assert.equal(property.name, 'name');
      assert.equal(property.implementation, ObjectDef);
    });

    it('isObject() returns true for functions starting with capital letter', function() {
      var ObjectDef = function() {
      };
      assert.isTrue(new barista.Property('Name', ObjectDef).isObject());
    });

    it('isObject() returns false for functions starting with lowercase letter', function() {
      var ObjectDef = function() {
      };
      assert.isFalse(new barista.Property('name', ObjectDef).isObject());
    });

    it('isObject() returns false for all other types', function() {
      var bool = true;
      var number = 1;
      var str = 'string';
      var date = new Date();
      var obj = {};

      assert.isFalse(new barista.Property('X', bool).isObject());
      assert.isFalse(new barista.Property('X', number).isObject());
      assert.isFalse(new barista.Property('X', str).isObject());
      assert.isFalse(new barista.Property('X', date).isObject());
      assert.isFalse(new barista.Property('X', obj).isObject());
      assert.isFalse(new barista.Property('X', null).isObject());
      assert.isFalse(new barista.Property('X').isObject());
    });
  });

  describe('PropertyExtractor', function() {
    it('extract() calls newPropFunc with args and returns property', function() {
      var ns = function() {
        var prop1 = 1,
            prop2 = 2,
            prop3 = 3;

        return {
          prop1: prop1,
          prop2: prop2,
          prop3: prop3
        };
      };

      var extractor = new barista.PropertyExtractor(ns, barista.newProperty);

      assert.equal(extractor.extract('prop1').name, 'prop1');
      assert.equal(extractor.extract('prop2').name, 'prop2');
      assert.equal(extractor.extract('prop3').name, 'prop3');
    });
  });
  describe('InjectionMapper', function() {
    var oneEntryDefaultMap,
        manyEntriesDefaultMap;

    beforeEach(function() {
      oneEntryDefaultMap = {
        s: {
          o: {
            '_default': 'found'
          }
        }
      };

      manyEntriesDefaultMap = {
        s1: {
          o1: {
            '_default': 'found'
          }
        },
        s2: {
          o2: {
            '_default': 'found'
          }
        },
        s3: {
          o3: {
            '_default': 'found'
          }
        }
      };
    });

    it('find() on empty map returns null', function() {
      assert.equal(new barista.InjectionMapper({}).find('s', 'o'), null);
    });

    it('find() on map with one entry returns match', function() {
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry with many registration returns match', function() {
      oneEntryDefaultMap.s.o.other1 = 'x';
      oneEntryDefaultMap.s.o.other2 = 'x';
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry returns match by defaulting default', function() {
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('s', 'o'), 'found');
    });

    it('find() on map with one entry returns returns null when no registration match', function() {
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('s', 'o', 'notfound'), null);
    });

    it('find() on map with one entry returns returns null when no object match', function() {
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('s', 'oNoMatch'), null);
    });

    it('find() on map with one entry returns returns null when no sourceNs match', function() {
      assert.equal(new barista.InjectionMapper(oneEntryDefaultMap).find('sNoMatch'), null);
    });

    it('find() on map with many entries returns match', function() {
      assert.equal(new barista.InjectionMapper(manyEntriesDefaultMap).find('s1', 'o1', '_default'), 'found');
    });

    it('find() on map with many entries not found returns null', function() {
      assert.equal(new barista.InjectionMapper(manyEntriesDefaultMap).find('s1', 'o1', 'notfound'), null);
    });

    it('map() on empty map returns mapping and sets _default', function() {
      var map = {};
      oneEntryDefaultMap.s.o.name = 'found';

      new barista.InjectionMapper(map).map('s', 'o', 'name', 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on empty map with null regname defaults regname to _default', function() {
      var map = {};
      new barista.InjectionMapper(map).map('s', 'o', null, 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() non-default regname maps, but does not overwrite existing _default', function() {
      var map = copy(oneEntryDefaultMap);
      oneEntryDefaultMap.s.o.notDefault = 'newInvoker';

      new barista.InjectionMapper(map).map('s', 'o', "notDefault", 'newInvoker');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one existing entry overwrites regname', function() {
      var map = copy(oneEntryDefaultMap);
      map.s.o.existingName = 'existingName';
      oneEntryDefaultMap.s.o.existingName = 'overwritten';

      new barista.InjectionMapper(map).map('s', 'o', 'existingName', 'overwritten');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one existing entry maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      oneEntryDefaultMap.s1 = {
        o1: {
          _default: 'found',
          name: 'found'
        }
      };

      new barista.InjectionMapper(map).map('s1', 'o1', 'name', 'found');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one entry and many existing regnames maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      map.s.o.existingReg = oneEntryDefaultMap.s.o.existingReg = 'existingReg';
      oneEntryDefaultMap.s.o.regname = 'found';

      new barista.InjectionMapper(map).map('s', 'o', 'regname', 'found');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with many entries maps new entry correctly', function() {
      var map = copy(manyEntriesDefaultMap);
      manyEntriesDefaultMap.s = {
        o: {
          _default: 'found',
          regname: 'found'
        }
      };

      new barista.InjectionMapper(map).map('s', 'o', 'regname', 'found');

      assert.deepEqual(map, manyEntriesDefaultMap);
    });

    it('map() on map with many entries maps additional regname correctly', function() {
      var map = copy(manyEntriesDefaultMap);
      manyEntriesDefaultMap.s1.o1.regname = 'found';

      new barista.InjectionMapper(map).map('s1', 'o1', 'regname', 'found');

      assert.deepEqual(map, manyEntriesDefaultMap);
    });
  });

  describe('ArgsWrapper', function() {
    it('wrap() null args returns empty array', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap(), []);
    });

    it('wrap() empty args returns empty array', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([]), []);
    });

    it('wrap() one arg returns wrapped arg', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([1]), [{value: 1}]);
    });

    it('wrap() many args returns wrapped args', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([1, 2, 3]), [{value: 1}, {value: 2}, {value: 3}]);
    });
  });

  describe('ArgsOverrider', function() {
    var overrider;

    beforeEach(function() {
      overrider = new barista.ArgsOverrider(new barista.ArgsWrapper());
    });

    it('override() with null args and null params returns empty array', function() {
      assert.deepEqual(overrider.override(), []);
    });

    it('override() with empty args and empty params returns empty array', function() {
      assert.deepEqual(overrider.override([], []), []);
    });

    it('override() with one arg and empty params returns wrapped arg', function() {
      assert.deepEqual(overrider.override([], ['arg1']), [{value: 'arg1'}]);
    });

    it('override() with many args and empty params returns wrapped args', function() {
      assert.deepEqual(overrider.override([], ['arg1', 'arg2', 'arg3']), [{value: 'arg1'}, {value: 'arg2'}, {value: 'arg3'}]);
    });

    it('override() with empty args and one param returns param', function() {
      assert.deepEqual(overrider.override(['param'], []), ['param']);
    });

    it('override() with empty args and many params returns params', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], []), ['param1', 'param2', 'param3']);
    });

    it('override() with one arg and many params returns overriden arg and remainder of params', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1']), [{value: 'arg1'}, 'param2', 'param3']);
    });

    it('override() with many args and many params returns overriden args', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3']), [{value: 'arg1'}, {value: 'arg2'}, {value: 'arg3'}]);
    });

    it('override() with less args and many params returns overriden args and remainer param', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2']), [{value: 'arg1'}, {value: 'arg2'}, 'param3']);
    });

    it('override() with more args and many params returns all args', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3', 'arg4']), [{value: 'arg1'}, {value: 'arg2'}, {value: 'arg3'}, {value: 'arg4'}]);
    });
  });

  describe('ResolvedParam', function() {
    it('namespace, object, and name properties set when all present in key', function() {
      var key = new barista.ResolvedParam('ns.object.name');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.object, 'object');
      assert.equal(key.name, 'name');
    });

    it('namespace, object, and name is defaulted to _default when absent', function() {
      var key = new barista.ResolvedParam('ns.object');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.object, 'object');
      assert.equal(key.name, '_default');
    });
  });

  describe('ParamResolver', function() {
    var sandbox,
        mapper,
        mockMapper,
        stubNewInjectionResolver,
        injectionResolver,
        mockInjectionResolver,
        resolver;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      mapper = new barista.InjectionMapper();
      mockMapper = sandbox.mock(mapper);
      stubNewInjectionResolver = sandbox.stub();
      injectionResolver = new barista.InjectionResolver();
      mockInjectionResolver = sandbox.mock(injectionResolver);
      resolver = new barista.ParamResolver(mapper, stubNewInjectionResolver);
    });

    afterEach(function() {
      mockMapper.verify();
      sandbox.restore();
    });

    it('resolve() with value param returns value', function() {
      assert.equal(resolver.resolve({value: 11}), 11);
    });

    it('resolve() with func calls func and returns value', function() {
      assert.equal(resolver.resolve({func: function() { return 11; }}), 11);
    });

    it('resolve() with resolve param returns resolved object', function() {
      var invoker = function() {
        return 'invoked';
      };
      mockMapper.expects('find').once().withExactArgs('ns', 'Object1', '_default').returns(invoker);
      assert.equal(resolver.resolve({resolve: 'ns.Object1'}), 'invoked');
    });

    it('resolve() with array of params returns resolved array', function() {
      var paramArray = [{resolve: 'ns.Object1'}, {value: 'value'}, {resolve: 'ns.Object2'}];
      stubNewInjectionResolver.withArgs(resolver).returns(injectionResolver);
      mockInjectionResolver.expects('resolve').once().withExactArgs(paramArray).returns('array_resolved');
      assert.equal(resolver.resolve({array: paramArray}), 'array_resolved');
    });
  });

  describe('InjectionResolver', function() {
    var sandbox,
        paramResolver,
        mockParamResolver,
        resolver;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      paramResolver = new barista.ParamResolver();
      mockParamResolver = sandbox.mock(paramResolver);
      resolver = new barista.InjectionResolver(paramResolver);
    });

    afterEach(function() {
      mockParamResolver.verify();
      sandbox.restore();
    });

    it('resolve() with empty params return empty array', function() {
      assert.deepEqual(resolver.resolve([]), []);
    });

    it('resolve() with one param returns resolved param', function() {
      mockParamResolver.expects('resolve').once().withArgs('param1').returns('resolved1');
      assert.deepEqual(resolver.resolve(['param1']), ['resolved1']);
    });

    it('resolve() with many params returns resolved params', function() {
      mockParamResolver.expects('resolve').once().withArgs('param1').returns('resolved1');
      mockParamResolver.expects('resolve').once().withArgs('param2').returns('resolved2');
      mockParamResolver.expects('resolve').once().withArgs('param3').returns('resolved3');
      assert.deepEqual(resolver.resolve(['param1', 'param2', 'param3']), ['resolved1', 'resolved2', 'resolved3']);
    });
  });

  describe('Maker', function() {
    var sandbox,
        injectionResolver,
        mockInjectionResolver,
        argsOverrider,
        mockArgsOverrider,
        maker;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      injectionResolver = new barista.InjectionResolver();
      mockInjectionResolver = sandbox.mock(injectionResolver);
      argsOverrider = new barista.ArgsOverrider();
      mockArgsOverrider = sandbox.mock(argsOverrider);
      maker = new barista.Maker(argsOverrider, injectionResolver);
    });

    afterEach(function() {
      mockInjectionResolver.verify();
      mockArgsOverrider.verify();
      sandbox.restore();
    });

    it('make() creates anonymous object like new operator', function() {
      var ObjectDef = function(arg1) {
        return {value1: arg1};
      },
          actual,
          expected;

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      expected = new ObjectDef('resolved1');
      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates standard object using "this" just like new operator', function() {
      var ObjectDef = function(arg1) {
        this.value1 = arg1;
      },
          actual,
          expected;

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      expected = new ObjectDef('resolved1');
      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates externally set prototype object just like new operator', function() {
      var ObjectDef = function(arg1) {
        this.value1 = arg1;
      },
          actual,
          expected;

      ObjectDef.prototype.getValue = function() {
        return this.value1 + 'X';
      };

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      expected = new ObjectDef('resolved1');
      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'resolved1');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'resolved1X');
      assert.equal(actual.getValue(), expected.getValue());
      assert.deepEqual(actual, expected);
    });
  });

  describe('OrderTaker', function() {
    var sandbox,
        maker,
        mockMaker,
        orderTaker;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      maker = new barista.Maker();
      mockMaker = sandbox.mock(maker);
      orderTaker = new barista.OrderTaker(maker);
    });

    afterEach(function() {
      mockMaker.verify();
      sandbox.restore();
    });

    it('orderPerDependency() returns func, executing it calls maker and returns new instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var instance = orderTaker.orderPerDependency('obj', 'params')('arg1', 'arg2', 'arg3');
      assert.equal(instance, 'instance');
    });

    it('orderSingleton() returns func, executing it multiple times calls maker only once and always returns same instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var func = orderTaker.orderSingleton('obj', 'params');
      var instance = func('arg1', 'arg2', 'arg3');
      var instance2 = func('argOther');
      assert.equal(instance, 'instance');
      assert.equal(instance, instance2);
    });

  });

  describe('InvokerBuilder', function() {
    var sandbox,
        mapper,
        mockMapper,
        orderTaker,
        mockOrderTaker,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      mapper = new barista.InjectionMapper();
      mockMapper = sandbox.mock(mapper);
      orderTaker = new barista.OrderTaker();
      mockOrderTaker = sandbox.mock(orderTaker);
      builder = new barista.InvokerBuilder(orderTaker, mapper);
    });

    afterEach(function() {
      mockMapper.verify();
      mockOrderTaker.verify();
      sandbox.restore();
    });

    it('build() with mapper finding invoker returns invoker', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'registrationName').returns('invoker');
      assert.equal(builder.build('ns', {name: 'propName'}, {name: 'registrationName'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates perdep invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'registrationName').returns(null);
      mockOrderTaker.expects("orderPerDependency").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'registrationName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: barista.perdependency, name: 'registrationName', params: 'params'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates singleton invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'registrationName').returns(null);
      mockOrderTaker.expects("orderSingleton").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'registrationName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: barista.singleton, name: 'registrationName', params: 'params'}), 'invoker');
    });
  });

  describe('NamespaceBuilder', function() {
    var sandbox,
        configMgr,
        mockConfigMgr,
        invokerBuilder,
        mockInvokerBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      configMgr = new barista.ConfigManager();
      mockConfigMgr = sandbox.mock(configMgr);
      invokerBuilder = new barista.InvokerBuilder();
      mockInvokerBuilder = sandbox.mock(invokerBuilder);
      builder = new barista.NamespaceBuilder(configMgr, invokerBuilder);
    });

    afterEach(function() {
      mockConfigMgr.verify();
      mockInvokerBuilder.verify();
      sandbox.restore();
    });

    it('build() with zero adds returns empty namespace', function() {
      assert.deepEqual(builder.build(), {});
    });

    it('build() with one added non-object returns namespace with prop', function() {
      var implementation = 'impl',
          prop = new barista.Property('impl', implementation);

      builder.add(prop);

      assert.deepEqual(builder.build(), {
        impl: implementation
      });
    });

    it('build() with one object with no registrations returns empty namespace', function() {
      var prop = new barista.Property('Name', function() {
      });
      mockConfigMgr.expects('getNsName').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([]);

      builder.add(prop);

      assert.deepEqual(builder.build(), {});
    });

    it('build() with one object with non-default registration returns namespace with invoker', function() {
      var registration = {
        name: 'notdefault'
      },
          prop = new barista.Property('Name', function() {
          });
      mockConfigMgr.expects('getNsName').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([registration]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registration).returns('invoker');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with default registrations returns namespace with invoker', function() {
      var registration = {
        name: '_default'
      },
          prop = new barista.Property('Name', function() {
          });
      mockConfigMgr.expects('getNsName').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([registration]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registration).returns('invoker');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with many registrations including default returns namespace with default invoker', function() {
      var registrations = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          prop = new barista.Property('Name', function() {
          });
      mockConfigMgr.expects('getNsName').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns(registrations);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[0]).returns('invoker');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[1]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[2]).returns('invokerY');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with many registrations with default last returns namespace with default invoker', function() {
      var registrations = [
        {name: 'X'},
        {name: 'Y'},
        {name: '_default'}
      ],
          prop = new barista.Property('Name', function() {
          });
      mockConfigMgr.expects('getNsName').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns(registrations);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[2]).returns('invoker');


      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with many objects with many registrations returns namespace with invokers', function() {
      var registrationsWithDefault = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          registrationsWithoutDefault = [
            {name: 'X'},
            {name: 'Y'}
          ],
          prop1 = new barista.Property('Name1', function() {
          }),
          prop2 = new barista.Property('Name2', function() {
          }),
          prop3 = new barista.Property('Name3', function() {
          });

      mockConfigMgr.expects('getNsName').thrice().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop1.name).once().returns(registrationsWithDefault);
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop2.name).once().returns(registrationsWithoutDefault);
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop3.name).once().returns(registrationsWithDefault);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, registrationsWithDefault[0]).returns('invoker1');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, registrationsWithDefault[1]).returns('invoker1X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, registrationsWithDefault[2]).returns('invoker1Y');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, registrationsWithoutDefault[0]).returns('invoker2');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, registrationsWithoutDefault[1]).returns('invoker2X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, registrationsWithDefault[0]).returns('invoker3');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, registrationsWithDefault[1]).returns('invoker3X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, registrationsWithDefault[2]).returns('invoker3Y');

      builder.add(prop1);
      builder.add(prop2);
      builder.add(prop3);

      assert.deepEqual(builder.build(), {
        Name1: 'invoker1',
        Name2: 'invoker2',
        Name3: 'invoker3'
      });
    });
  });

  describe('Processor', function() {
    var sandbox,
        builder,
        mockBuilder,
        extractor,
        mockExtractor,
        processor;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      builder = new barista.NamespaceBuilder();
      mockBuilder = sandbox.mock(builder);
      extractor = new barista.PropertyExtractor();
      mockExtractor = sandbox.mock(extractor);
      processor = new barista.Processor(extractor, builder);
    });

    afterEach(function() {
      mockExtractor.verify();
      mockBuilder.verify();
      sandbox.restore();
    });

    it('process() with zero properties returns namespace', function() {
      mockBuilder.expects('build').once().returns('namespace');
      assert.equal(processor.process({}), 'namespace');
    });

    it('process() with one property adds to namespace', function() {
      mockExtractor.expects('extract').withExactArgs('prop1').once().returns('extracted1');
      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(processor.process({
        prop1: 1
      }), 'namespace');
    });

    it('process() with many properties adds to namespace', function() {
      mockExtractor.expects('extract').withExactArgs('prop1').once().returns('extracted1');
      mockExtractor.expects('extract').withExactArgs('prop2').once().returns('extracted2');
      mockExtractor.expects('extract').withExactArgs('prop3').once().returns('extracted3');

      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('add').withExactArgs('extracted2').once();
      mockBuilder.expects('add').withExactArgs('extracted3').once();

      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(processor.process({
        prop1: 1,
        prop2: 2,
        prop3: 3
      }), 'namespace');
    });
  });

  describe('Barista Namespace', function() {
    var nsSimple,
        nsUtils,
        nsResponsibilities,
        nsWidget;

    beforeEach(function() {
      barista = new Barista();
      nsSimple = function(dependency) {
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
      };

      nsUtils = function() {
        function Tester(value) {
          function test() {
            return value;
          }
          return {
            test: test
          };
        }

        function Prepender(prefix) {
          function prepend(value) {
            return prefix + value;
          }
          return {
            prepend: prepend
          };
        }

        function Capitalizer() {
          function capitalize(value) {
            return value.toUpperCase();
          }
          return {
            capitalize: capitalize
          };
        }

        function ChainOfResponsibilities(responsibilities) {
          function execute(context) {
            responsibilities.forEach(function(responsibility) {
              responsibility.execute(context);
            });
          }
          return {
            execute: execute
          };
        }

        return {
          Tester: Tester,
          Prepender: Prepender,
          Capitalizer: Capitalizer,
          ChainOfResponsibilities: ChainOfResponsibilities
        };
      };

      nsResponsibilities = function() {
        function PrependResponsibility(prepender) {
          function execute(context) {
            context.value = prepender.prepend(context.value);
          }
          return {
            execute: execute
          };
        }

        function PrependAndCapitalizeResponsibility(prepender, capitalizer) {
          function execute(context) {
            context.value = prepender.prepend(capitalizer.capitalize(context.value));
          }
          return {
            execute: execute
          };
        }

        function AppendXsResponsibility(count) {
          function execute(context) {
            var i;
            for (i = 0; i < count; ++i) {
              context.value = context.value + 'X';
            }
          }
          return {
            execute: execute
          };
        }

        return {
          PrependResponsibility: PrependResponsibility,
          PrependAndCapitalizeResponsibility: PrependAndCapitalizeResponsibility,
          AppendXsResponsibility: AppendXsResponsibility
        };
      };

      nsWidget = function() {
        function Widget1(controller) {
          function run(value) {
            var context = {
              value: value
            };
            controller.execute(context);
            return 'Widget1' + context.value;
          }
          return {
            run: run
          };
        }

        function Widget2(controller) {
          function run(value) {
            var context = {
              value: value
            };
            controller.execute(context);
            return 'Widget2' + context.value;
          }
          return {
            run: run
          };
        }

        return {
          Widget1: Widget1,
          Widget2: Widget2
        };
      };
    });

    it('singleton and perdependecy properites are exposed and set', function() {
      assert.equal(barista.singleton, 'singleton');
      assert.equal(barista.perdependency, 'perdependency');
    });

    it('serve() with simple use controls instancing: ObjDef2 configured as singleton', function() {
      var servedNs = barista.serve(new nsSimple('depends'), 'Simple', {
        ObjDef2: {type: barista.singleton}
      }),
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

    it('serve() using multiple namespaces directly, including various instancing configurations, and full dependency injection', function() {
      var servedUtilsNs = barista.serve(new nsUtils(), 'Utils', {
        Prepender: {params: [{value: '+'}]},
        Capitalizer: {type: barista.singleton},
        ChainOfResponsibilities: [{
            name: 'widget1Controller',
            params: {
              array: [
                {resolve: 'Responsibilities.PrependResponsibility'},
                {resolve: 'Responsibilities.PrependAndCapitalizeResponsibility'},
                {resolve: 'Responsibilities.AppendXsResponsibility.x3'}
              ]
            }
          },
          {
            name: 'widget2Controller',
            params: {
              array: [
                {resolve: 'Responsibilities.PrependAndCapitalizeResponsibility'},
                {resolve: 'Responsibilities.AppendXsResponsibility.x1'}
              ]
            }
          }]
      }),
          servedWidgetNs = barista.serve(new nsWidget(), 'Widget', {
            Widget1: {params: {resolve: 'Utils.ChainOfResponsibilities.widget1Controller'}},
            Widget2: {params: {resolve: 'Utils.ChainOfResponsibilities.widget2Controller'}}
          });

      barista.serve(new nsResponsibilities(), 'Responsibilities', {
        PrependResponsibility: {params: [{resolve: 'Utils.Prepender'}]},
        PrependAndCapitalizeResponsibility: {
          params: [
            {resolve: 'Utils.Prepender'},
            {resolve: 'Utils.Capitalizer'}
          ]
        },
        AppendXsResponsibility: [
          {name: 'x3', params: {value: 3}},
          {name: 'x1', params: [{value: 1}]}
        ]
      });

      assert.equal(servedUtilsNs.Prepender('overriden').prepend('value'), 'overridenvalue');
      assert.equal(servedWidgetNs.Widget1().run('eleven'), 'Widget1++ELEVENXXX');
      assert.equal(servedWidgetNs.Widget2().run('tenplusone'), 'Widget2+TENPLUSONEX');
    });

    it('resolve() instead of using namespaces directly', function() {
      barista.serve(new nsUtils(), 'Utils', {
        Tester: {
          name: 'notdefault',
          params: {
            value: 'uses _default'
          }
        },
        Prepender: [
          {params: [{value: '+'}]},
          {name: 'special', params: [{value: 'special'}]}
        ],
        Capitalizer: {type: barista.singleton},
        ChainOfResponsibilities: [{
            name: 'widget1Controller',
            params: {
              array: [
                {resolve: 'Responsibilities.PrependResponsibility'},
                {resolve: 'Responsibilities.PrependAndCapitalizeResponsibility'},
                {resolve: 'Responsibilities.AppendXsResponsibility'}
              ]
            }
          },
          {
            name: 'widget2Controller',
            params: {
              array: [
                {resolve: 'Responsibilities.PrependAndCapitalizeResponsibility'},
                {resolve: 'Responsibilities.AppendXsResponsibility.x1'}
              ]
            }
          }]
      });

      barista.serve(new nsResponsibilities(), 'Responsibilities', {
        PrependResponsibility: {params: [{resolve: 'Utils.Prepender'}]},
        PrependAndCapitalizeResponsibility: {
          params: [
            {resolve: 'Utils.Prepender'},
            {resolve: 'Utils.Capitalizer'}
          ]
        },
        AppendXsResponsibility: [
          {name: 'x3', params: {value: 3}},
          {name: 'x1', params: [{value: 1}]}
        ]
      });

      barista.serve(new nsWidget(), 'Widget', {
        Widget1: {params: {resolve: 'Utils.ChainOfResponsibilities.widget1Controller'}},
        Widget2: {params: {resolve: 'Utils.ChainOfResponsibilities.widget2Controller'}}
      });

      assert.equal(barista.resolve('Utils.Tester').test(), 'uses _default');
      assert.equal(barista.resolve('Utils.Tester.notdefault').test(), 'uses _default');
      assert.equal(barista.resolve('Widget.Widget1').run('eleven'), 'Widget1++ELEVENXXX');
      assert.equal(barista.resolve('Widget.Widget1').run('eleven'), 'Widget1++ELEVENXXX');
      assert.equal(barista.resolve('Widget.Widget2').run('tenplusone'), 'Widget2+TENPLUSONEX');
      assert.equal(barista.resolve('Widget.Widget2', barista.resolve('Utils.ChainOfResponsibilities.widget1Controller')).run('tenplusone'), 'Widget2++TENPLUSONEXXX');
      assert.equal(barista.resolve('Utils.Prepender.special').prepend('value'), 'specialvalue');
      assert.equal(barista.resolve('Utils.Prepender.special', 'overriden1').prepend('value'), 'overriden1value');
      assert.equal(barista.resolve('Utils.Prepender', 'overriden2').prepend('value'), 'overriden2value');
    });
  });
});