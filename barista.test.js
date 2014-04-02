describe('JsBarista', function() {

  describe('Maker', function() {
    it('make() creates anonymous object like new operator', function() {
      var ObjectDef = function(arg1) {
        return {arg1: arg1};
      };

      var expected = new ObjectDef(11);
      var actual = new jsb.Maker().make(ObjectDef, [11]);

      assert.equal(actual.arg1, expected.arg1);
      assert.equal(actual.prototype, expected.prototype);
    });

    it('make() creates standard object using this just like new operator', function() {
      var ObjectDef = function() {
        this.val1 = 11;
      };

      var expected = new ObjectDef(11);
      var actual = new jsb.Maker().make(ObjectDef, [11]);

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
      var actual = new jsb.Maker().make(ObjectDef, [11]);

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

      var property = new jsb.Property('name', ObjectDef);

      assert.equal(property.name, 'name');
      assert.equal(property.implementation, ObjectDef);
    });

    it('isObject() returns true for functions starting with capital letter', function() {
      var ObjectDef = function() {
      };
      assert.isTrue(new jsb.Property('Name', ObjectDef).isObject());
    });

    it('isObject() returns false for functions starting with lowercase letter', function() {
      var ObjectDef = function() {
      };
      assert.isFalse(new jsb.Property('name', ObjectDef).isObject());
    });

    it('isObject() returns false for all other types', function() {
      var bool = true;
      var number = 1;
      var str = 'string';
      var date = new Date();
      var obj = {};

      assert.isFalse(new jsb.Property('X', bool).isObject());
      assert.isFalse(new jsb.Property('X', number).isObject());
      assert.isFalse(new jsb.Property('X', str).isObject());
      assert.isFalse(new jsb.Property('X', date).isObject());
      assert.isFalse(new jsb.Property('X', obj).isObject());
      assert.isFalse(new jsb.Property('X', null).isObject());
      assert.isFalse(new jsb.Property('X').isObject());
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

      var extractor = new jsb.PropertyExtractor(ns, jsb.newProperty);

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
      assert.equal(new jsb.InjectionMapper({}).find('s', 'o'), null);
    });

    it('find() on map with one entry returns match', function() {
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry with many registration returns match', function() {
      oneEntryDefaultMap.s.o.other1 = 'x';
      oneEntryDefaultMap.s.o.other2 = 'x';
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry returns match by defaulting default', function() {
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('s', 'o'), 'found');
    });

    it('find() on map with one entry returns returns null when no registration match', function() {
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('s', 'o', 'notfound'), null);
    });

    it('find() on map with one entry returns returns null when no object match', function() {
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('s', 'oNoMatch'), null);
    });

    it('find() on map with one entry returns returns null when no sourceNs match', function() {
      assert.equal(new jsb.InjectionMapper(oneEntryDefaultMap).find('sNoMatch'), null);
    });

    it('find() on map with many entries returns match', function() {
      assert.equal(new jsb.InjectionMapper(manyEntriesDefaultMap).find('s1', 'o1', '_default'), 'found');
    });

    it('find() on map with many entries not found returns null', function() {
      assert.equal(new jsb.InjectionMapper(manyEntriesDefaultMap).find('s1', 'o1', 'notfound'), null);
    });

    it('map() on empty map returns mapping', function() {
      var map = {};
      new jsb.InjectionMapper(map).map('s', 'o', '_default', 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on empty map with null regname defaults regname to _default', function() {
      var map = {};
      new jsb.InjectionMapper(map).map('s', 'o', null, 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one existing entry overwrites regname', function() {
      var map = oneEntryDefaultMap;
      new jsb.InjectionMapper(map).map('s', 'o', '_default', 'overwritten');
      assert.equal(map.s.o._default, 'overwritten');
    });

    it('map() on map with one existing entry maps correctly', function() {
      var map = oneEntryDefaultMap;
      new jsb.InjectionMapper(map).map('s1', 'o1', null, 'found');
      assert.equal(map.s1.o1._default, 'found');
    });

    it('map() on map with many existing regnames maps correctly', function() {
      var map = oneEntryDefaultMap;
      oneEntryDefaultMap.s.o.existingReg = 'existingReg';
      new jsb.InjectionMapper(map).map('s', 'o', 'regname', 'found');
      assert.equal(map.s.o.regname, 'found');
    });

    it('map() on map with many entries maps new entry correctly', function() {
      var map = manyEntriesDefaultMap;
      new jsb.InjectionMapper(map).map('s', 'o', 'regname', 'found');
      assert.equal(map.s.o.regname, 'found');
    });

    it('map() on map with many entries maps additional regname correctly', function() {
      var map = manyEntriesDefaultMap;
      new jsb.InjectionMapper(map).map('s1', 'o1', 'regname', 'found');
      assert.equal(map.s1.o1.regname, 'found');
    });

  });

  describe('ConfigDefaulter', function() {
    var defaultConfig = {
      type: 'perdep',
      name: '_default'
    };

    it('setRegistrationDefaults() does nothing when zero registrations', function() {
      assert.deepEqual(new jsb.ConfigDefaulter().setRegistrationDefaults([]), []);
    });

    it('setRegistrationDefaults() with one registration adds type and name if undefined', function() {
      assert.deepEqual(new jsb.ConfigDefaulter().setRegistrationDefaults([{}]), [defaultConfig]);
    });

    it('setRegistrationDefaults() with one registration adds type or name if undefined', function() {
      assert.deepEqual(new jsb.ConfigDefaulter().setRegistrationDefaults([{type: 'perdep'}]), [defaultConfig]);
      assert.deepEqual(new jsb.ConfigDefaulter().setRegistrationDefaults([{name: '_default'}]), [defaultConfig]);
    });

    it('setRegistrationDefaults() with many registrations adds type and name if undefined', function() {
      assert.deepEqual(new jsb.ConfigDefaulter().setRegistrationDefaults([{}, {}, {}]), [defaultConfig, defaultConfig, defaultConfig]);
    });
    
    it('setNsDefault() with empty config gets defaulted ns', function() {
      var config = {}
      assert.equal(new jsb.ConfigDefaulter().setNsDefault(config), 'namespace');
      assert.deepEqual(config, {ns: 'namespace'});
    });
    
    it('setNsDefault() with config and ns set does not overwrite', function() {
      var config = {ns: 'original'}
      assert.equal(new jsb.ConfigDefaulter().setNsDefault(config), 'original');
      assert.deepEqual(config, {ns: 'original'});
    });
    
    it('setNsDefault() with config other properties defaults ns but does not overwrite other props', function() {
      var config = {someProp: 'original'}
      assert.equal(new jsb.ConfigDefaulter().setNsDefault(config), 'namespace');
      assert.deepEqual(config, {
        ns: 'namespace',
        someProp: 'original'
      });
    });

  });

  describe('ConfigManager', function() {
    var sandbox,
        defaulter,
        mockDefaulter;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      defaulter = new jsb.ConfigDefaulter();
      mockDefaulter= sandbox.mock(defaulter);
      
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

      assert.deepEqual(new jsb.ConfigManager(null, defaulter).getRegistrations('name'), 'config');
    });
    
    it('getRegistrations() returns defaulted registration when empty config', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{}])
        .returns('config');

      assert.deepEqual(new jsb.ConfigManager({}, defaulter).getRegistrations('name'), 'config');
    });
    
    it('getRegistrations() returns default registration when one non-matching config', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{}])
        .returns('config');

      assert.deepEqual(new jsb.ConfigManager({Name: {}}, defaulter).getRegistrations('nothere'), 'config');
    });
    
    it('getRegistrations() returns matching registration in array when one matching config without array', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{v: 1}])
        .returns('config');

      assert.deepEqual(new jsb.ConfigManager({Name: {v: 1}}, defaulter).getRegistrations('Name'), 'config');
    });
    
    it('getRegistrations() returns matching registration when one matching config and already in array', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{v: 1}])
        .returns('config');

      assert.deepEqual(new jsb.ConfigManager({Name: [{v: 1}]}, defaulter).getRegistrations('Name'), 'config');
    });
    
    it('getRegistrations() returns matching registration when many configs', function() {
      mockDefaulter
        .expects('setRegistrationDefaults')
        .once()
        .withExactArgs([{x:'configPlace'}])
        .returns('config');

      assert.deepEqual(new jsb.ConfigManager({
        Name: 'configName',
        Place: [{x:'configPlace'}],
        Thing: 'configThing'
      }, defaulter).getRegistrations('Place'), 'config');
    });
    
    it('getNs() returns config.ns', function() {
      mockDefaulter
        .expects('setNsDefault')
        .once()
        .withExactArgs('config')
        .returns('ns');

      assert.equal(new jsb.ConfigManager('config', defaulter).getNs(), 'ns');
    });
  });

  describe('OrderTaker', function() {
    var sandbox,
        maker,
        mockMaker,
        orderTaker;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      maker = new jsb.Maker();
      mockMaker = sandbox.mock(maker);
      orderTaker = new jsb.OrderTaker(maker);
    });

    afterEach(function() {
      mockMaker.verify();
      sandbox.restore();
    });

    it('orderPerDependency() returns func, executing it calls maker and returns new instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var instance = orderTaker.orderPerDependency('obj')('arg1', 'arg2', 'arg3');
      assert.equal(instance, 'instance');
    });

    it('orderSingleton() returns func, executing it multiple times calls maker only once and always returns same instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('obj', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var func = orderTaker.orderSingleton('obj');
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
      mapper = new jsb.InjectionMapper();
      mockMapper = sandbox.mock(mapper);
      orderTaker = new jsb.OrderTaker();
      mockOrderTaker = sandbox.mock(orderTaker);
      builder = new jsb.InvokerBuilder(orderTaker, mapper);
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
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: 'perdep', name: 'registrationName', params: 'params'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates singleton invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'registrationName').returns(null);
      mockOrderTaker.expects("orderSingleton").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'registrationName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: 'single', name: 'registrationName', params: 'params'}), 'invoker');
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
      configMgr = new jsb.ConfigManager();
      mockConfigMgr = sandbox.mock(configMgr);
      invokerBuilder = new jsb.InvokerBuilder();
      mockInvokerBuilder = sandbox.mock(invokerBuilder);
      builder = new jsb.NamespaceBuilder(configMgr, invokerBuilder);
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
          prop = new jsb.Property('impl', implementation);
      
      builder.add(prop);

      assert.deepEqual(builder.build(), {
        impl: implementation
      });
    });

    it('build() with one object with no registrations returns empty namespace', function() {
      var prop = new jsb.Property('Name', function() {
      });
      mockConfigMgr.expects('getNs').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([]);
      
      builder.add(prop);

      assert.deepEqual(builder.build(), {});
    });

    it('build() with one object with non-default registrations returns namespace with prop', function() {
      var registration = {
        name: 'notdefault'
      },
          prop = new jsb.Property('Name', function() {
      });
      mockConfigMgr.expects('getNs').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([registration]);      
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registration).returns('invoker');
      
      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with default registrations returns namespace with prop', function() {
      var registration = {
        name: '_default'
      },
          prop = new jsb.Property('Name', function() {
      });
      mockConfigMgr.expects('getNs').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns([registration]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registration).returns('invoker');
      
      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with many registrations returns namespace with prop', function() {
      var registrations = [{
        name: '_default'
      },{
        name: 'special'
      }],
          prop = new jsb.Property('Name', function() {
      });
      mockConfigMgr.expects('getNs').once().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop.name).once().returns(registrations);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[0]).returns('invoker');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, registrations[1]).returns('invoker_special');
      
      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with many objects with many registrations returns namespace with props', function() {
      var registrations = [{
        name: '_default'
      },{
        name: 'special'
      }],
          prop1 = new jsb.Property('Name1', function() {
      }),
          prop2 = new jsb.Property('Name2', function() {
      }),
          prop3 = new jsb.Property('Name3', function() {
      });

      mockConfigMgr.expects('getNs').thrice().returns('ns');
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop1.name).once().returns(registrations);
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop2.name).once().returns(registrations);
      mockConfigMgr.expects('getRegistrations').withExactArgs(prop3.name).once().returns(registrations);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, registrations[0]).returns('invoker1');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, registrations[1]).returns('invoker1_special');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, registrations[0]).returns('invoker2');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, registrations[1]).returns('invoker2_special');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, registrations[0]).returns('invoker3');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, registrations[1]).returns('invoker3_special');

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

  describe('Barista', function() {
    var sandbox,
        builder,
        mockBuilder,
        extractor,
        mockExtractor,
        barista;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      builder = new jsb.NamespaceBuilder();
      mockBuilder = sandbox.mock(builder);
      extractor = new jsb.PropertyExtractor();
      mockExtractor = sandbox.mock(extractor);
      barista = new jsb.Barista(extractor, builder);
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
    it('using baristafied namespace directly', function() {
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
          servedNs = jsb.serve(new ns('depends'), {
            ns: 'ns',
            ObjDef2: {type: 'single'}
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
  });
});