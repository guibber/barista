describe('Barista Tests', function() {
  describe('NamespaceNameGenerator', function() {
    it('generate() returns Namespace1 then increments', function() {
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace1');
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace2');
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace3');
    });
  });
  
  describe('Menu', function() {
    var sandbox,
        defaulter,
        mockDefaulter,
        nameGenerator,
        mockNameGenerator,
        menu;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      defaulter = new barista.ItemDefaulter();
      mockDefaulter = sandbox.mock(defaulter);
      nameGenerator = new barista.NamespaceNameGenerator();
      mockNameGenerator = sandbox.mock(nameGenerator);
      menu = new barista.Menu(nameGenerator, defaulter);
    });

    afterEach(function() {
      mockDefaulter.verify();
      sandbox.restore();
    });
    
    it('getNamespace() without forNamespace returns defaulted value', function() {
      mockNameGenerator.expects('generate').once().returns('defaulted');
      assert.equal(menu.getNamespace(), 'defaulted');
    });
    
    it('forNamespace() and getNamespace() sets and returns namespace name', function() {
      assert.deepEqual(menu.forNamespace('name').get(), {name: 'name', details: {}});
      assert.equal(menu.getNamespace(), 'name');
    });

    it('get() without withItem() or forNamespace() returns empty details', function() {
      assert.deepEqual(menu.get(), {details: {}});
    });
    
    it('get() with one withItem() returns default from itemDefaulter', function() {
      mockDefaulter.expects('getDefaultItem').once().returns('defaultReg');
      assert.deepEqual(menu
        .withItem('one')
        .get(), {
          details: {
            one: ['defaultReg']
          }
        });
    });

    it('get() with one withItem.asSingleton() is registered as singleton', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({});
      assert.deepEqual(menu
        .withItem('one')
        .asSingleton()
        .get(), {
          details: {
            one: [{type: 'singleton'}]
          }
        });
    });

    it('get() with one withItem.asPerDependency() is registered as perdependency', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({});
      assert.deepEqual(menu
        .withItem('one')
        .asPerDependency()
        .get(), {
          details: {
            one: [{type: 'perdependency'}]
          }
        });
    });

    it('get() with one withItem.named() sets name', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({});
      assert.deepEqual(menu
        .withItem('one')
        .named('name')
        .get(), {
          details: {
            one: [{name: 'name'}]
          }
        });
    });

    it('get() with one withItem.withValueParam() sets value param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withValueParam('value')
        .get(), {
          details: {
            one: [{params: [{value: 'value'}]}]
          }
        });
    });

    it('get() with one withItem.withResolveParam() sets resolve param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withResolveParam('resolve')
        .get(), {
          details: {
            one: [{params: [{resolve: 'resolve'}]}]
          }
        });
    });

    it('get() with one withItem.withFuncParam() sets func param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withFuncParam('func')
        .get(), {
          details: {
            one: [{params: [{func: 'func'}]}]
          }
        });
    });

    it('get() with one withItem.withArrayParam() sets empty array param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withArrayParam()
        .get(), {
          details: {
            one: [{params: [{array: []}]}]
          }
        });
    });

    it('get() with one withItem.withArrayParam.includingResolveParam() sets array param with one resolve param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withArrayParam()
        .includingResolveParam('resolve1')
        .get(), {
          details: {
            one: [{params: [{array: [{resolve: 'resolve1'}]}]}]
          }
        });
    });

    it('get() with one withItem.withArrayParam.includingValueParam() sets array param with one value param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withArrayParam()
        .includingValueParam('value1')
        .get(), {
          details: {
            one: [{params: [{array: [{value: 'value1'}]}]}]
          }
        });
    });

    it('get() with one withItem.withArrayParam.includingFuncParam() sets array param with one func param', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({params: []});
      assert.deepEqual(menu
        .withItem('one')
        .withArrayParam()
        .includingFuncParam('func1')
        .get(), {
          details: {
            one: [{params: [{array: [{func: 'func1'}]}],}]
          }
        });
    });

    it('get() with many withItem() of same object sets array of default items', function() {
      mockDefaulter.expects('getDefaultItem').thrice().returns('defaultReg');
      assert.deepEqual(menu
        .withItem('one')
        .withItem('one')
        .withItem('one')
        .get(), {
          details: {
            one: ['defaultReg', 'defaultReg', 'defaultReg']
          }
        });
    });

    it('get() with many withItem() sets default items', function() {
      mockDefaulter.expects('getDefaultItem').thrice().returns('defaultReg');
      assert.deepEqual(menu
        .withItem('one')
        .withItem('two')
        .withItem('three')
        .get(), {
          details: {
            one: ['defaultReg'],
            two: ['defaultReg'],
            three: ['defaultReg']
          }
        });
    });

    it('get() with many items covering all options configures correctly', function() {
      mockDefaulter.expects('getDefaultItem').once().returns({name: 'unset', params: [], type: 'unset'});
      mockDefaulter.expects('getDefaultItem').once().returns({name: 'unset', params: [], type: 'unset'});
      mockDefaulter.expects('getDefaultItem').once().returns({name: 'unset', params: [], type: 'unset'});

      assert.deepEqual(menu
        .forNamespace('namespace')
        .withItem('one')
        .named('one')
        .asSingleton()
        .withValueParam('one-value')
        .withFuncParam('one-func')
        .withResolveParam('one-resolve')
        .withArrayParam()
        .includingValueParam('array-value')
        .includingFuncParam('array-func')
        .includingResolveParam('array-resolve')
        .withItem('two')
        .named('two')
        .asPerDependency()
        .withValueParam('two-value')
        .withFuncParam('two-func')
        .withResolveParam('two-resolve')
        .withArrayParam()
        .includingValueParam('array-value')
        .includingFuncParam('array-func')
        .includingResolveParam('array-resolve')
        .withItem('three')
        .withValueParam('three-value')
        .withFuncParam('three-func')
        .withResolveParam('three-resolve')
        .withArrayParam()
        .includingValueParam('array-value')
        .includingFuncParam('array-func')
        .includingResolveParam('array-resolve')
        .get(), {
          name: 'namespace',
          details: {
            one: [{
              name: 'one',
              params: [
                {value: 'one-value'},
                {func: 'one-func'},
                {resolve: 'one-resolve'},
                {
                  array: [
                    {value: 'array-value'},
                    {func: 'array-func'},
                    {resolve: 'array-resolve'}
                  ]
                }
              ],
              type: 'singleton'
            }],
            two: [{
              name: 'two',
              params: [
                {value: 'two-value'},
                {func: 'two-func'},
                {resolve: 'two-resolve'},
                {
                  array: [
                    {value: 'array-value'},
                    {func: 'array-func'},
                    {resolve: 'array-resolve'}
                  ]
                }
              ],
              type: 'perdependency'
            }],
            three: [{
              name: 'unset',
              params: [
                {value: 'three-value'},
                {func: 'three-func'},
                {resolve: 'three-resolve'},
                {
                  array: [
                    {value: 'array-value'},
                    {func: 'array-func'},
                    {resolve: 'array-resolve'}
                  ]
                }
              ],
              type: 'unset'
            }]
          }
        });
    });
    
    it('getItems on non-existing name returns defaulted', function() {
      mockDefaulter.expects('setItemDefaults').once().withExactArgs([{}]).returns('defaulted');
      assert.deepEqual(menu.getItems('notthere'), 'defaulted');
    });
    
    it('getItems on existing name returns', function() {
      mockDefaulter.expects('getDefaultItem').once().returns('defaulted');
      menu.withItem('name');
      mockDefaulter.expects('setItemDefaults').once().withExactArgs(['defaulted']).returns('defaultedExisting');
      
      assert.deepEqual(menu.getItems('name'), 'defaultedExisting');
    });

    it('calling named() without withItem() throws', function() {
      assert.throw(function() { menu.named(); }, 'call to named() without call to withItem() is invalid');
    });

    it('calling asSingleton() without withItem() throws', function() {
      assert.throw(function() { menu.asSingleton(); }, 'call to asSingleton() without call to withItem() is invalid');
    });

    it('calling asPerDependency() without withItem() throws', function() {
      assert.throw(function() { menu.asPerDependency(); }, 'call to asPerDependency() without call to withItem() is invalid');
    });

    it('calling withResolveParam() without withItem() throws', function() {
      assert.throw(function() { menu.withResolveParam(); }, 'call to withResolveParam() without call to withItem() is invalid');
    });

    it('calling withValueParam() without withItem() throws', function() {
      assert.throw(function() { menu.withValueParam(); }, 'call to withValueParam() without call to withItem() is invalid');
    });

    it('calling withFuncParam() without withItem() throws', function() {
      assert.throw(function() { menu.withFuncParam(); }, 'call to withFuncParam() without call to withItem() is invalid');
    });

    it('calling withArrayParam() without withItem() throws', function() {
      assert.throw(function() { menu.withArrayParam(); }, 'call to withArrayParam() without call to withItem() is invalid');
    });

    it('calling includingResolveParam() without withArrayParam() throws', function() {
      assert.throw(function() { menu.includingResolveParam(); }, 'call to includingResolveParam() without call to withArrayParam() is invalid');
    });

    it('calling includingValueParam() without withArrayParam() throws', function() {
      assert.throw(function() { menu.includingValueParam(); }, 'call to includingValueParam() without call to withArrayParam() is invalid');
    });

    it('calling includingFuncParam() without withArrayParam() throws', function() {
      assert.throw(function() { menu.includingFuncParam(); }, 'call to includingFuncParam() without call to withArrayParam() is invalid');
    });

    it('calling includingResolveParam() after withItem() without withArrayParam() throws', function() {
      assert.throw(function() {
        menu
          .withItem('one')
          .withArrayParam()
          .includingResolveParam('resolve')
          .withItem('one')
          .includingResolveParam('resolve');
      }, 'call to includingResolveParam() without call to withArrayParam() is invalid');
    });
  });

  describe('ItemDefaulter (default mode of not strict)', function() {
    var defaultRegistration = {
      type: 'perdependency',
      name: '_default',
      params: []
    };

    it('getDefaultItem() returns object with type, name and params set', function() {
      assert.deepEqual(new barista.ItemDefaulter().getDefaultItem(), defaultRegistration);
    });

    it('setItemDefaults() does nothing when zero items', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([]), []);
    });

    it('setItemDefaults() with one item adds type and name and params if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{}]), [defaultRegistration]);
    });

    it('setItemDefaults() with one item adds type or name and params if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{type: 'perdependency'}]), [defaultRegistration]);
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{name: '_default'}]), [defaultRegistration]);
    });

    it('setItemDefaults() with many items adds type and name if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{}, {}, {}]), [defaultRegistration, defaultRegistration, defaultRegistration]);
    });
  });

  describe('ItemDefaulter (strict mode)', function() {
    var defaultRegistration = {
      type: 'not_set',
      name: '_default',
      params: []
    };

    beforeEach(function() {
      barista = new Barista({useStrict: true});
    });

    it('getDefaultItem() returns object with type, name and params set', function() {
      assert.deepEqual(new barista.ItemDefaulter().getDefaultItem(), defaultRegistration);
    });

    it('setItemDefaults() does nothing when zero items', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([]), []);
    });

    it('setItemDefaults() with one item adds type and name and params if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{}]), [defaultRegistration]);
    });

    it('setItemDefaults() with one item adds type or name and params if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{type: 'not_set'}]), [defaultRegistration]);
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{name: '_default'}]), [defaultRegistration]);
    });

    it('setItemDefaults() with many items adds type and name if undefined', function() {
      assert.deepEqual(new barista.ItemDefaulter().setItemDefaults([{}, {}, {}]), [defaultRegistration, defaultRegistration, defaultRegistration]);
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

    it('isObject() returns true for functions', function() {
      var objectDef = function() {
      };
      assert.isTrue(new barista.Property('Name', objectDef).isObject());
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
      barista = new Barista({injectionMap: {}});
      assert.equal(new barista.InjectionMapper().find('s', 'o'), null);
    });

    it('find() on map with one entry returns match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry with many item returns match', function() {
      oneEntryDefaultMap.s.o.other1 = 'x';
      oneEntryDefaultMap.s.o.other2 = 'x';
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s', 'o', '_default'), 'found');
    });

    it('find() on map with one entry returns match by defaulting default', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s', 'o'), 'found');
    });

    it('find() on map with one entry returns returns null when no item match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s', 'o', 'notfound'), null);
    });

    it('find() on map with one entry returns returns null when no object match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s', 'oNoMatch'), null);
    });

    it('find() on map with one entry returns returns null when no sourceNs match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('sNoMatch'), null);
    });

    it('find() on map with many entries returns match', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s1', 'o1', '_default'), 'found');
    });

    it('find() on map with many entries not found returns null', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('s1', 'o1', 'notfound'), null);
    });

    it('map() on empty map returns mapping and sets _default', function() {
      var map = {};
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.s.o.name = 'found';

      new barista.InjectionMapper().map('s', 'o', 'name', 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on empty map with null regname defaults regname to _default', function() {
      var map = {};
      barista = new Barista({injectionMap: map});
      new barista.InjectionMapper().map('s', 'o', null, 'found');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() non-default regname maps, but does not overwrite existing _default', function() {
      var map = copy(oneEntryDefaultMap);
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.s.o.notDefault = 'newInvoker';

      new barista.InjectionMapper().map('s', 'o', "notDefault", 'newInvoker');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one existing entry overwrites regname', function() {
      var map = copy(oneEntryDefaultMap);
      map.s.o.existingName = 'existingName';
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.s.o.existingName = 'overwritten';

      new barista.InjectionMapper().map('s', 'o', 'existingName', 'overwritten');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one existing entry maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.s1 = {
        o1: {
          _default: 'found',
          name: 'found'
        }
      };

      new barista.InjectionMapper().map('s1', 'o1', 'name', 'found');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one entry and many existing regnames maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      map.s.o.existingReg = oneEntryDefaultMap.s.o.existingReg = 'existingReg';
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.s.o.regname = 'found';

      new barista.InjectionMapper().map('s', 'o', 'regname', 'found');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with many entries maps new entry correctly', function() {
      var map = copy(manyEntriesDefaultMap);
      barista = new Barista({injectionMap: map});
      manyEntriesDefaultMap.s = {
        o: {
          _default: 'found',
          regname: 'found'
        }
      };

      new barista.InjectionMapper().map('s', 'o', 'regname', 'found');

      assert.deepEqual(map, manyEntriesDefaultMap);
    });

    it('map() on map with many entries maps additional regname correctly', function() {
      var map = copy(manyEntriesDefaultMap);
      barista = new Barista({injectionMap: map});
      manyEntriesDefaultMap.s1.o1.regname = 'found';

      new barista.InjectionMapper().map('s1', 'o1', 'regname', 'found');

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

    it('make() creates named object like new operator', function() {
      var actual,
          expected;

      function ObjectDef(arg1) {
        return {value1: arg1};
      }

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      expected = new ObjectDef('resolved1');
      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates anonymous object using "this" just like new operator', function() {

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

    it('make() creates named object using "this" just like new operator', function() {
      var actual,
          expected;

      function ObjectDef(arg1) {
        this.value1 = arg1;
      }

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      expected = new ObjectDef('resolved1');
      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates anonymous externally set prototype object just like new operator', function() {
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

    it('make() creates named externally set prototype object just like new operator', function() {
      var actual,
          expected;

      function ObjectDef(arg1) {
        this.value1 = arg1;
      }

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

    it('make() creates inheritted object just like new operator', function() {
      var actual,
          expected;

      function ObjectDefSuper(arg1) {
        this.value1 = arg1;
      }

      ObjectDefSuper.prototype.getValue = function() {
        return this.value1 + 'X';
      };

      function ObjectDef(arg1) {
        ObjectDefSuper.call(this, arg1);
      }

      ObjectDef.prototype = Object.create(ObjectDefSuper.prototype);
      ObjectDef.prototype.constructor = ObjectDef;

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

    it('make() on function returns execution result', function() {
      var someFunc = function(args1) {
        return args1;
      };

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      assert.equal(maker.make(someFunc, ['param1'], ['arg1']), 'resolved1');
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
        .withExactArgs('impl', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var instance = orderTaker.orderPerDependency('impl', 'params')('arg1', 'arg2', 'arg3');
      assert.equal(instance, 'instance');
    });

    it('orderSingleton() returns func, executing it multiple times calls maker only once and always returns same instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('impl', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var func = orderTaker.orderSingleton('impl', 'params');
      var instance = func('arg1', 'arg2', 'arg3');
      var instance2 = func('argOther');
      assert.equal(instance, 'instance');
      assert.equal(instance, instance2);
    });

    it('orderNotSet() returns func, executing it throws', function() {
      var func = orderTaker.orderNotSet('impl');
      assert.throw(function() { func(); }, 'using barista in strict mode requires that you register "impl" using menu.withItem and specifying asSingleton or asPerDependency');
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
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'itemName').returns('invoker');
      assert.equal(builder.build('ns', {name: 'propName'}, {name: 'itemName'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates perdep invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'itemName').returns(null);
      mockOrderTaker.expects("orderPerDependency").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'itemName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: 'perdependency', name: 'itemName', params: 'params'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates singleton invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'itemName').returns(null);
      mockOrderTaker.expects("orderSingleton").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'itemName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: 'singleton', name: 'itemName', params: 'params'}), 'invoker');
    });

    it('build() with mapper not finding invoker creates not_set invoker, maps and returns', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'propName', 'itemName').returns(null);
      mockOrderTaker.expects("orderNotSet").withExactArgs('implementation', 'params').once().returns('invoker');
      mockMapper.expects('map').once().withExactArgs('ns', 'propName', 'itemName', 'invoker');
      assert.equal(builder.build('ns', {name: 'propName', implementation: 'implementation'}, {type: 'not_set', name: 'itemName', params: 'params'}), 'invoker');
    });
  });

  describe('NamespaceBuilder', function() {
    var sandbox,
        menu,
        mockMenu,
        invokerBuilder,
        mockInvokerBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      menu = new barista.Menu();
      mockMenu = sandbox.mock(menu);
      invokerBuilder = new barista.InvokerBuilder();
      mockInvokerBuilder = sandbox.mock(invokerBuilder);
      builder = new barista.NamespaceBuilder(menu, invokerBuilder);
    });

    afterEach(function() {
      mockMenu.verify();
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

    it('build() with one object with no items returns empty namespace', function() {
      var prop = new barista.Property('Name', function() {
      });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop.name).once().returns([]);

      builder.add(prop);

      assert.deepEqual(builder.build(), {});
    });

    it('build() with one object with non-default item returns namespace with invoker', function() {
      var item = {
        name: 'notdefault'
      },
          prop = new barista.Property('Name', function() {
          });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop.name).once().returns([item]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, item).returns('invoker');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with default items returns namespace with invoker', function() {
      var item = {
        name: '_default'
      },
          prop = new barista.Property('Name', function() {
          });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop.name).once().returns([item]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, item).returns('invoker');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with many items including default returns namespace with default invoker', function() {
      var items = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          prop = new barista.Property('Name', function() {
          });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop.name).once().returns(items);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[0]).returns('invoker');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[1]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[2]).returns('invokerY');

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with one object with many items with default last returns namespace with default invoker', function() {
      var items = [
        {name: 'X'},
        {name: 'Y'},
        {name: '_default'}
      ],
          prop = new barista.Property('Name', function() {
          });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop.name).once().returns(items);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, items[2]).returns('invoker');


      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with many objects with many items returns namespace with invokers', function() {
      var itemsWithDefault = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          itemsWithoutDefault = [
            {name: 'X'},
            {name: 'Y'}
          ],
          prop1 = new barista.Property('Name1', function() {
          }),
          prop2 = new barista.Property('Name2', function() {
          }),
          prop3 = new barista.Property('Name3', function() {
          });

      mockMenu.expects('getNamespace').thrice().returns('ns');
      mockMenu.expects('getItems').withExactArgs(prop1.name).once().returns(itemsWithDefault);
      mockMenu.expects('getItems').withExactArgs(prop2.name).once().returns(itemsWithoutDefault);
      mockMenu.expects('getItems').withExactArgs(prop3.name).once().returns(itemsWithDefault);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, itemsWithDefault[0]).returns('invoker1');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, itemsWithDefault[1]).returns('invoker1X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop1, itemsWithDefault[2]).returns('invoker1Y');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, itemsWithoutDefault[0]).returns('invoker2');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop2, itemsWithoutDefault[1]).returns('invoker2X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, itemsWithDefault[0]).returns('invoker3');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, itemsWithDefault[1]).returns('invoker3X');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop3, itemsWithDefault[2]).returns('invoker3Y');

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

  describe('Barista', function() {
    beforeEach(function() {
      barista = new Barista();
    });

    it('menu() returns new Menu with new ItemDefaulter', function() {
      assert.deepEqual(barista.menu().withItem('one').get(), {
        details: {
          one: [{name: '_default', params: [], type: 'perdependency'}]
        }
      });
    });

    it('menu() returns new Menu for each call', function() {
      assert.notEqual(barista.menu(), barista.menu());
    });

    it('serve() with no menu defaults menu', function() {
      var nsSimple = function() {
        function ObjDef1() { return {}; }
        return {
          ObjDef1: ObjDef1
        };
      },
          servedNs = barista.serve(new nsSimple());

      assert.isObject(servedNs.ObjDef1());
    });

    it('serve() with simple namespace, no-dependency injection, controls instancing where ObjDef2 registered as singleton', function() {
      var nsSimple = function(dependency) {
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
          servedNs = barista.serve(new nsSimple('depends'), barista.menu()
            .withItem('ObjDef2')
            .asSingleton()
          ),
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

    it('serve() and make() using multiple namespaces, including various instancing types, and full dependency injection', function() {
      var nsUtils = function() {
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

        function addAlternatingChar(value, character) {
          var i,
              ret = '';
          for (i = 0; i < value.length; ++i) {
            ret += value.charAt(i) + character;
          }
          return ret;
        }

        return {
          addAlternatingChar: addAlternatingChar,
          Tester: Tester,
          Prepender: Prepender,
          Capitalizer: Capitalizer,
          ChainOfResponsibilities: ChainOfResponsibilities
        };
      },
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

            function AppendPlusesResponsibility(count) {
              function execute(context) {
                var i;
                for (i = 0; i < count; ++i) {
                  context.value = context.value + '+';
                }
              }
              return {
                execute: execute
              };
            }

            function WrapResponsibility() {
              function execute(context) {
                context.value = '[' + context.value + ']';
              }
              return {
                execute: execute
              };
            }

            return {
              PrependResponsibility: PrependResponsibility,
              PrependAndCapitalizeResponsibility: PrependAndCapitalizeResponsibility,
              AppendPlusesResponsibility: AppendPlusesResponsibility,
              WrapResponsibility: WrapResponsibility
            };
          },
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
          },
          servedUtilsNs = barista.serve(new nsUtils(), barista.menu()
            .forNamespace('Utils')
            .withItem('addAlternatingChar').withValueParam('default').withValueParam(' ')
            .withItem('Tester').named('notdefault').withValueParam('uses _default')
            .withItem('Prepender').withValueParam('-')
            .withItem('Prepender').named('special').withValueParam('special')
            .withItem('Capitalizer').asSingleton()
            .withItem('ChainOfResponsibilities').named('widget1Controller')
            .withArrayParam()
            .includingResolveParam('Responsibilities.PrependResponsibility')
            .includingResolveParam('Responsibilities.AppendPlusesResponsibility.p3')
            .includingResolveParam('Responsibilities.WrapResponsibility')
            .withItem('ChainOfResponsibilities').named('widget2Controller')
            .withArrayParam()
            .includingResolveParam('Responsibilities.PrependAndCapitalizeResponsibility')
            .includingResolveParam('Responsibilities.AppendPlusesResponsibility.p1')
            .includingResolveParam('Responsibilities.WrapResponsibility')
          ),
          servedWidgetNs = barista.serve(new nsWidget(), barista.menu()
            .forNamespace('Widget')
            .withItem('Widget1').withResolveParam('Utils.ChainOfResponsibilities.widget1Controller')
            .withItem('Widget2').withResolveParam('Utils.ChainOfResponsibilities.widget2Controller')
          );

      barista.serve(new nsResponsibilities(), barista.menu()
        .forNamespace('Responsibilities')
        .withItem('PrependResponsibility').withResolveParam('Utils.Prepender')
        .withItem('PrependAndCapitalizeResponsibility').withResolveParam('Utils.Prepender').withResolveParam('Utils.Capitalizer')
        .withItem('AppendPlusesResponsibility').named('p3').withValueParam(3)
        .withItem('AppendPlusesResponsibility').named('p1').withValueParam(1)
      );

      assert.equal(servedUtilsNs.Prepender('overriden').prepend('value'), 'overridenvalue');
      assert.equal(servedWidgetNs.Widget1().run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(servedWidgetNs.Widget2().run('initial_value'), 'Widget2[-INITIAL_VALUE+]');
      assert.equal(servedUtilsNs.addAlternatingChar('value'), 'v a l u e ');
      assert.equal(servedUtilsNs.addAlternatingChar('value', '-'), 'v-a-l-u-e-');

      assert.equal(barista.make('Utils.Tester').test(), 'uses _default');
      assert.equal(barista.make('Utils.Tester.notdefault').test(), 'uses _default');
      assert.equal(barista.make('Widget.Widget1').run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(barista.make('Widget.Widget1').run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(barista.make('Widget.Widget2').run('initial_value'), 'Widget2[-INITIAL_VALUE+]');
      assert.equal(barista.make('Widget.Widget2', barista.make('Utils.ChainOfResponsibilities.widget1Controller')).run('initial_value'), 'Widget2[-initial_value+++]');
      assert.equal(barista.make('Utils.Prepender.special').prepend('value'), 'specialvalue');
      assert.equal(barista.make('Utils.Prepender.special', 'overriden1').prepend('value'), 'overriden1value');
      assert.equal(barista.make('Utils.Prepender', 'overriden2').prepend('value'), 'overriden2value');
      assert.equal(barista.make('Utils.addAlternatingChar', 'value'), 'v a l u e ');
      assert.equal(barista.make('Utils.addAlternatingChar', 'value', '-'), 'v-a-l-u-e-');
    });

    it('serve() and make() throw when using strict mode involving not fully registered object', function() {
      barista = new Barista({useStrict: true});
      var nsSimple = function() {
        function ObjNoRegistration() { return {}; }
        function ObjNoType() { return {}; }
        function ObjDependentUponObjNoRegistration(obj) { return {obj: obj}; }

        return {
          ObjNoRegistration: ObjNoRegistration,
          ObjNoType: ObjNoType,
          ObjDependentUponObjNoRegistration: ObjDependentUponObjNoRegistration
        };
      },
          servedNs = barista.serve(new nsSimple(), barista.menu()
            .forNamespace('Simple')
            .withItem('ObjNoType')
            .withItem('ObjDependentUponObjNoRegistration').asPerDependency().withResolveParam('Simple.ObjNoRegistration')
          );
      assert.throw(function() { servedNs.ObjNoRegistration(); }, 'using barista in strict mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
      assert.throw(function() { servedNs.ObjNoType(); }, 'using barista in strict mode requires that you register "function ObjNoType() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
      assert.throw(function() { servedNs.ObjDependentUponObjNoRegistration(); }, 'using barista in strict mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
      assert.throw(function() { barista.make('Simple.ObjNoRegistration'); }, 'using barista in strict mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
      assert.throw(function() { barista.make('Simple.ObjNoType'); }, 'using barista in strict mode requires that you register "function ObjNoType() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
      assert.throw(function() { barista.make('Simple.ObjDependentUponObjNoRegistration'); }, 'using barista in strict mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying asSingleton or asPerDependency');
    });
  });
});