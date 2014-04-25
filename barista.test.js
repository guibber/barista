describe('Barista Tests', function() {
  describe('NamespaceNameGenerator', function() {
    it('generate() returns Namespace1 then increments', function() {
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace1');
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace2');
      assert.equal(new barista.NamespaceNameGenerator().generate(), 'Namespace3');
    });
  });

  describe('Param', function() {
    it('Param() sets type and value properties', function() {
      var actual = new barista.Param('type', 'value');
      assert.equal(actual.type, 'type');
      assert.equal(actual.value, 'value');
    });
  });

  describe('Params', function() {
    var sandbox,
        stubNewParamFunc,
        stubNewParamsFunc,
        params;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stubNewParamFunc = sandbox.stub();
      stubNewParamsFunc = sandbox.stub();
      params = new barista.Params(stubNewParamFunc, stubNewParamsFunc);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('Params() sets value property to empty array and type to array', function() {
      assert.deepEqual(params.value, []);
      assert.equal(params.type, 'array');
    });

    it('withValueParam() creates new param, adds to params and returns this', function() {
      stubNewParamFunc.withArgs('value', 'value').returns('param');
      assert.deepEqual(params.withValueParam('value').value, ['param']);
    });

    it('withResolveParam() sets resolve param and returns this', function() {
      stubNewParamFunc.withArgs('resolve', 'value').returns('param');
      assert.deepEqual(params.withResolveParam('value').value, ['param']);
    });

    it('withFuncParam() sets func param and returns this', function() {
      stubNewParamFunc.withArgs('func', 'value').returns('param');
      assert.deepEqual(params.withFuncParam('value').value, ['param']);
    });

    it('withArrayParam() sets array param, calls addArrayParamsFunc and returns this', function() {
      var stubArrayParamsFunc = sandbox.stub();
      stubNewParamsFunc.returns('params');
      stubArrayParamsFunc.withArgs('params');
      assert.deepEqual(params.withArrayParam(stubArrayParamsFunc).value, ['params']);
    });
  });

  describe('Entry', function() {
    var sandbox,
        params,
        mockParams,
        entry;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      params = new barista.Params();
      mockParams = sandbox.mock(params);
      entry = new barista.Entry(params);
    });

    afterEach(function() {
      mockParams.verify();
      sandbox.restore();
    });

    it('Entry() sets params property to paramObj.params', function() {
      params.params = 'params';
      assert.deepEqual(entry.params, []);
    });

    it('named() sets name and returns this', function() {
      assert.equal(entry.named('test').name, 'test');
    });

    it('singleton() sets type to singleton and returns this', function() {
      assert.equal(entry.singleton().type, 'singleton');
    });

    it('perDependency() sets type to perdependency and returns this', function() {
      assert.equal(entry.perDependency().type, 'perdependency');
    });

    it('perDependency() returns this', function() {
      assert.equal(entry.perDependency(), entry);
    });

    it('withValueParam() sets value param and returns this', function() {
      mockParams.expects('withValueParam').once().withExactArgs('value');
      assert.equal(entry.withValueParam('value'), entry);
    });

    it('withResolveParam() sets resolve param and returns this', function() {
      mockParams.expects('withResolveParam').once().withExactArgs('value');
      assert.equal(entry.withResolveParam('value'), entry);
    });

    it('withFuncParam() sets func param', function() {
      mockParams.expects('withFuncParam').once().withExactArgs('value');
      assert.equal(entry.withFuncParam('value'), entry);
    });

    it('withArrayParam() sets array param', function() {
      mockParams.expects('withArrayParam').once().withExactArgs('addFunc');
      assert.equal(entry.withArrayParam('addFunc'), entry);
    });

  });

  describe('EntryDefaulter (default of requireReg mode off)', function() {
    var sandbox,
        stubNewEntryFunc,
        defaulter,
        defaultEntry = {
          type: 'perdependency',
          name: '_default',
          params: []
        };

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stubNewEntryFunc = sandbox.stub();
      stubNewEntryFunc.returns({});
      defaulter = new barista.EntryDefaulter(stubNewEntryFunc);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('getDefaultedEntry() with empty object sets type, name and params', function() {
      assert.deepEqual(defaulter.getDefaultedEntry({}), defaultEntry);
    });

    it('getDefaultedEntry() with all already set does nothing', function() {
      assert.deepEqual(defaulter.getDefaultedEntry({
          type: 'set',
          name: 'set',
          params: 'set'
        }), {
          type: 'set',
          name: 'set',
          params: 'set'
        });
    });

    it('getDefaultedEntries() with no entries array returns one defaulted', function() {
      assert.deepEqual(defaulter.getDefaultedEntries(), [defaultEntry]);
    });

    it('getDefaultedEntries() with empty entries array returns one defaulted entry', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([]), [defaultEntry]);
    });

    it('getDefaultedEntries() with one entry adds type and name and params if undefined', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([{}]), [defaultEntry]);
    });

    it('getDefaultedEntries() with many entries adds type and name if undefined', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([{}, {}, {}]), [defaultEntry, defaultEntry, defaultEntry]);
    });
  });

  describe('EntryDefaulter (requireReg mode on)', function() {
    var sandbox,
        stubNewEntryFunc,
        defaulter,
        defaultEntry = {
          type: 'not_set',
          name: '_default',
          params: []
        };

    beforeEach(function() {
      barista = new Barista({requireReg: true});
      sandbox = sinon.sandbox.create();
      stubNewEntryFunc = sandbox.stub();
      stubNewEntryFunc.returns({});
      defaulter = new barista.EntryDefaulter(stubNewEntryFunc);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('getDefaultedEntry() with empty object sets type, name and params', function() {
      assert.deepEqual(defaulter.getDefaultedEntry({}), defaultEntry);
    });

    it('getDefaultedEntry() with all already set does nothing', function() {
      assert.deepEqual(defaulter.getDefaultedEntry({
          type: 'set',
          name: 'set',
          params: 'set'
        }), {
          type: 'set',
          name: 'set',
          params: 'set'
        });
    });

    it('getDefaultedEntries() with no entries array returns one defaulted', function() {
      assert.deepEqual(defaulter.getDefaultedEntries(), [defaultEntry]);
    });

    it('getDefaultedEntries() with empty entries array returns one defaulted entry', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([]), [defaultEntry]);
    });

    it('getDefaultedEntries() with one entry adds type and name and params if undefined', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([{}]), [defaultEntry]);
    });

    it('getDefaultedEntries() with many entries adds type and name if undefined', function() {
      assert.deepEqual(defaulter.getDefaultedEntries([{}, {}, {}]), [defaultEntry, defaultEntry, defaultEntry]);
    });
  });

  describe('MenuItem', function() {
    var sandbox,
        stubNewEntryFunc,
        item;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stubNewEntryFunc = sandbox.stub();
      item = new barista.MenuItem('name', stubNewEntryFunc);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('MenuItem() sets entries property to empty array and name property to name', function() {
      assert.deepEqual(item.entries, []);
      assert.equal(item.name, 'name');
    });

    it('withEntry()creates entry includes in entries array and returns entry', function() {
      stubNewEntryFunc.returns('entry');
      assert.equal(item.withEntry(), 'entry');
      assert.deepEqual(item.entries, ['entry']);
    });
  });


  describe('Menu', function() {
    var sandbox,
        defaulter,
        mockDefaulter,
        nameGenerator,
        mockNameGenerator,
        stubNewMenuItem,
        menu;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      defaulter = new barista.EntryDefaulter();
      mockDefaulter = sandbox.mock(defaulter);
      nameGenerator = new barista.NamespaceNameGenerator();
      mockNameGenerator = sandbox.mock(nameGenerator);
      stubNewMenuItem = sandbox.stub();
      menu = new barista.Menu(nameGenerator, defaulter, stubNewMenuItem);
    });

    afterEach(function() {
      mockDefaulter.verify();
      mockNameGenerator.verify();
      sandbox.restore();
    });

    it('forNamespace() sets namespace name and getNamespace() returns name', function() {
      menu.forNamespace('name');
      assert.equal(menu.name, 'name');
      assert.equal(menu.getNamespace(), 'name');
    });

    it('getNamespace() without forNamespace returns defaulted value', function() {
      mockNameGenerator.expects('generate').once().returns('defaulted');
      assert.equal(menu.getNamespace(), 'defaulted');
    });

    it('getEntries() with no item returns newMenuItem entries', function() {
      stubNewMenuItem.withArgs('item').returns({entries: 'entries'});
      assert.deepEqual(menu.getEntries('item'), 'entries');
    });

    it('getEntries() with one entry no match returns newMenuItem entries', function() {
      menu.items = {nonMatch: {entries: 'nonMatch'}};
      stubNewMenuItem.withArgs('item').returns({entries: 'entries'});
      assert.deepEqual(menu.getEntries('item'), 'entries');
    });

    it('getEntries() with one matching item returns entries', function() {
      menu.items = {item: {entries: 'entries'}};
      assert.deepEqual(menu.getEntries('item'), 'entries');
    });

    it('getEntries() with many items and matching returns entries', function() {
      menu.items = {
        item1: {entries: 'entries1'},
        item2: {entries: 'entries2'},
        item3: {entries: 'entries3'}
      };
      assert.deepEqual(menu.getEntries('item1'), 'entries1');
    });

    it('getEntries() with many items and no match returns newMenuItem entries', function() {
      menu.items = {
        item1: {entries: 'entries1'},
        item2: {entries: 'entries2'},
        item3: {entries: 'entries3'}
      };
      stubNewMenuItem.withArgs('item1').returns({entries: 'entries'});
      assert.deepEqual(menu.getEntries('item1'), 'entries1');
    });

    it('getDefaultedEntries() returns returns defaulted entries', function() {
      menu.items = {item: {entries: 'entries'}};
      mockDefaulter.expects('getDefaultedEntries').once().withExactArgs('entries').returns('defaultedEntries');
      assert.deepEqual(menu.getDefaultedEntries('item'), 'defaultedEntries');
    });

    it('withItem() with first call for item name creates and sets MenuItem and returns new Entry', function() {
      var item = {withEntry: function() { return 'entry'; }};
      stubNewMenuItem.withArgs('item').returns(item);
      mockDefaulter.expects('getDefaultedEntry').withExactArgs('entry').once().returns('defaultEntry');
      assert.equal(menu.withItem('item'), 'defaultEntry');
      assert.deepEqual(menu.items, {item: item});
    });

    it('withItem() on subsequent call for item name returns new Entry', function() {
      var i = 0,
          item = {withEntry: function() { return 'entry' + ++i; }};
      stubNewMenuItem.withArgs('item').onCall(0).returns(item);
      mockDefaulter.expects('getDefaultedEntry').withExactArgs('entry1').once().returns('defaultEntry1');
      mockDefaulter.expects('getDefaultedEntry').withExactArgs('entry2').once().returns('defaultEntry2');
      assert.equal(menu.withItem('item'), 'defaultEntry1');
      assert.equal(menu.withItem('item'), 'defaultEntry2');
      assert.deepEqual(menu.items, {item: item});
    });
  });

  describe('Property', function() {
    it('Property() sets name and implementation properties', function() {
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
    it('extract() with no properties returns property with undefined implementation', function() {
      var ns = function() {
        return {};
      };

      var extractor = new barista.PropertyExtractor(new ns(), barista.newProperty);

      assert.equal(extractor.extract('prop1').name, 'prop1');
      assert.equal(extractor.extract('prop1').implementation, undefined);
    });

    it('extract() one property creates and returns properties', function() {
      var ns = function() {
        var prop1 = 1;

        return {
          prop1: prop1
        };
      };

      var extractor = new barista.PropertyExtractor(new ns(), barista.newProperty);

      assert.equal(extractor.extract('prop1').name, 'prop1');
      assert.equal(extractor.extract('prop1').implementation, 1);
    });

    it('extract() many properties creates and returns properties', function() {
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

      var extractor = new barista.PropertyExtractor(new ns(), barista.newProperty);

      assert.equal(extractor.extract('prop1').name, 'prop1');
      assert.equal(extractor.extract('prop1').implementation, 1);
      assert.equal(extractor.extract('prop2').name, 'prop2');
      assert.equal(extractor.extract('prop2').implementation, 2);
      assert.equal(extractor.extract('prop3').name, 'prop3');
      assert.equal(extractor.extract('prop3').implementation, 3);
    });
  });

  describe('InjectionMapper', function() {
    var oneEntryDefaultMap,
        manyEntriesDefaultMap;

    beforeEach(function() {
      oneEntryDefaultMap = {
        ns: {
          item: {
            '_default': 'invoker'
          }
        }
      };

      manyEntriesDefaultMap = {
        ns1: {
          item1: {
            '_default': 'invoker'
          }
        },
        ns2: {
          item2: {
            '_default': 'invoker'
          }
        },
        ns3: {
          item3: {
            '_default': 'invoker'
          }
        }
      };
    });

    it('find() on empty map returns null', function() {
      barista = new Barista({injectionMap: {}});
      assert.equal(new barista.InjectionMapper().find('ns', 'item'), null);
    });

    it('find() on map with one item and one entry returns match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns', 'item', '_default'), 'invoker');
    });

    it('find() on map with one item and many entries returns match', function() {
      oneEntryDefaultMap.ns.item.other1 = 'x';
      oneEntryDefaultMap.ns.item.other2 = 'x';
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns', 'item', '_default'), 'invoker');
    });

    it('find() on map with one item and one entry returns match by defaulting default', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns', 'item'), 'invoker');
    });

    it('find() on map with one item and one entry returns returns null when no entry name match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns', 'item', 'notfound'), null);
    });

    it('find() on map with one item and one entry returns null when no item match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns', 'itemNoMatch'), null);
    });

    it('find() on map with one item and one entry returns null when no namespace match', function() {
      barista = new Barista({injectionMap: oneEntryDefaultMap});
      assert.equal(new barista.InjectionMapper().find('nsNoMatch'), null);
    });

    it('find() on map with many items and entries returns match', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns1', 'item1', '_default'), 'invoker');
    });

    it('find() on map with many items and entries returns null when no entry name match', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns1', 'item1', 'notfound'), null);
    });

    it('find() on map with many items and entries returns null when no item match', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('ns1', 'noItemMatch'), null);
    });

    it('find() on map with many items and entries returns null when no namespace match', function() {
      barista = new Barista({injectionMap: manyEntriesDefaultMap});
      assert.equal(new barista.InjectionMapper().find('nsNoMatch'), null);
    });

    it('map() on empty map sets _default and named entry to invoker', function() {
      var map = {};
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.ns.item.name = 'invoker';

      new barista.InjectionMapper().map('ns', 'item', 'name', 'invoker');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on empty map with null entry name defaults entry name to _default and sets', function() {
      var map = {};
      barista = new Barista({injectionMap: map});
      new barista.InjectionMapper().map('ns', 'item', null, 'invoker');
      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() with one item and entry using non-default entry name sets entry, but does not overwrite existing _default', function() {
      var map = copy(oneEntryDefaultMap);
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.ns.item.notDefault = 'invoker2';

      new barista.InjectionMapper().map('ns', 'item', "notDefault", 'invoker2');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() with one item and existing entry overwrites entry name', function() {
      var map = copy(oneEntryDefaultMap);
      map.ns.item.existingName = 'existingInvoker';
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.ns.item.existingName = 'overwrittenInvoker';

      new barista.InjectionMapper().map('ns', 'item', 'existingName', 'overwrittenInvoker');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() on map with one item and entry maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.ns1 = {
        item1: {
          _default: 'invoker',
          name: 'invoker'
        }
      };

      new barista.InjectionMapper().map('ns1', 'item1', 'name', 'invoker');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() with one item and many existing entry names maps correctly', function() {
      var map = copy(oneEntryDefaultMap);
      map.ns.item.existing = oneEntryDefaultMap.ns.item.existing = 'existing';
      barista = new Barista({injectionMap: map});
      oneEntryDefaultMap.ns.item.entryname = 'invoker';

      new barista.InjectionMapper().map('ns', 'item', 'entryname', 'invoker');

      assert.deepEqual(map, oneEntryDefaultMap);
    });

    it('map() with many items and many entries maps new item and entry correctly', function() {
      var map = copy(manyEntriesDefaultMap);
      barista = new Barista({injectionMap: map});
      manyEntriesDefaultMap.ns = {
        item: {
          _default: 'invoker',
          entry: 'invoker'
        }
      };

      new barista.InjectionMapper().map('ns', 'item', 'entry', 'invoker');

      assert.deepEqual(map, manyEntriesDefaultMap);
    });

    it('map() with many items and entries maps additional entry name on existing item', function() {
      var map = copy(manyEntriesDefaultMap);
      barista = new Barista({injectionMap: map});
      manyEntriesDefaultMap.ns1.item1.entry = 'invoker';

      new barista.InjectionMapper().map('ns1', 'item1', 'entry', 'invoker');

      assert.deepEqual(map, manyEntriesDefaultMap);
    });
  });

  describe('ArgsWrapper', function() {
    it('wrap() with null args returns empty array', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap(), []);
    });

    it('wrap() with empty args returns empty array', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([]), []);
    });

    it('wrap() with one arg returns wrapped arg', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([1]), [{type: 'value', value: 1}]);
    });

    it('wrap() with many args returns wrapped args', function() {
      assert.deepEqual(new barista.ArgsWrapper().wrap([1, 2, 3]), [
        {type: 'value', value: 1},
        {type: 'value', value: 2},
        {type: 'value', value: 3}]);
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
      assert.deepEqual(overrider.override([], ['arg1']), [{type: 'value', value: 'arg1'}]);
    });

    it('override() with many args and empty params returns wrapped args', function() {
      assert.deepEqual(overrider.override([], ['arg1', 'arg2', 'arg3']), [
        {type: 'value', value: 'arg1'},
        {type: 'value', value: 'arg2'},
        {type: 'value', value: 'arg3'}]);
    });

    it('override() with empty args and one param returns param', function() {
      assert.deepEqual(overrider.override(['param'], []), ['param']);
    });

    it('override() with empty args and many params returns params', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], []), ['param1', 'param2', 'param3']);
    });

    it('override() with one arg and many params returns overriden arg and remainder of params', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1']), [
        {type: 'value', value: 'arg1'},
        'param2',
        'param3'
      ]);
    });

    it('override() with many args and many params returns overriden args', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3']), [
        {type: 'value', value: 'arg1'},
        {type: 'value', value: 'arg2'},
        {type: 'value', value: 'arg3'}]);
    });

    it('override() with less args and many params returns overriden args and remaining param', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2']), [
        {type: 'value', value: 'arg1'},
        {type: 'value', value: 'arg2'},
        'param3'
      ]);
    });

    it('override() with more args and many params returns all args', function() {
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3', 'arg4']), [
        {type: 'value', value: 'arg1'},
        {type: 'value', value: 'arg2'},
        {type: 'value', value: 'arg3'},
        {type: 'value', value: 'arg4'}]);
    });
  });

  describe('ResolvedParam', function() {
    it('ResolvedParam() sets namespace, item, and name properties when all present in key', function() {
      var key = new barista.ResolvedParam('ns.item.entry');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.item, 'item');
      assert.equal(key.entry, 'entry');
    });

    it('ResolvedParam() sets namespace and item, and entry is defaulted to _default when absent', function() {
      var key = new barista.ResolvedParam('ns.item');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.item, 'item');
      assert.equal(key.entry, '_default');
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
      assert.equal(resolver.resolve({type: 'value', value: 11}), 11);
    });

    it('resolve() with func calls func and returns value', function() {
      assert.equal(resolver.resolve({type: 'func', value: function() { return 11; }}), 11);
    });

    it('resolve() with resolve param returns resolved invoked item', function() {
      var invoker = function() {
        return 'invoked';
      };
      mockMapper.expects('find').once().withExactArgs('ns', 'item', '_default').returns(invoker);
      assert.equal(resolver.resolve({type: 'resolve', value: 'ns.item'}), 'invoked');
    });

    it('resolve() with non-existing resolve param returns null', function() {
      mockMapper.expects('find').once().withExactArgs('ns', 'item', '_default').returns(null);
      assert.isNull(resolver.resolve({type: 'resolve', value: 'ns.item'}));
    });

    it('resolve() with array of params returns resolved array', function() {
      var paramArray = [
        {type: 'resolve', value: 'ns.Object1'},
        {type: 'value', value: 'value'},
        {type: 'resolve', value: 'ns.Object2'}
      ];
      stubNewInjectionResolver.withArgs(resolver).returns(injectionResolver);
      mockInjectionResolver.expects('resolve').once().withExactArgs(paramArray).returns('array_resolved');

      assert.equal(resolver.resolve({type: 'array', value: paramArray}), 'array_resolved');
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
          expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates named object like new operator', function() {
      function ObjectDef(arg1) {
        return {value1: arg1};
      }
      var expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates anonymous object using "this" just like new operator', function() {
      var ObjectDef = function(arg1) {
        this.value1 = arg1;
      },
          expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates named object using "this" just like new operator', function() {
      function ObjectDef(arg1) {
        this.value1 = arg1;
      }
      var expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates anonymous externally set prototype object just like new operator', function() {
      var ObjectDef = function(arg1) {
        this.value1 = arg1;
      };
      ObjectDef.prototype.getValue = function() {
        return this.value1 + 'X';
      };
      var expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'resolved1');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'resolved1X');
      assert.equal(actual.getValue(), expected.getValue());
      assert.deepEqual(actual, expected);
    });

    it('make() creates named externally set prototype object just like new operator', function() {
      function ObjectDef(arg1) {
        this.value1 = arg1;
      }
      ObjectDef.prototype.getValue = function() {
        return this.value1 + 'X';
      };
      var expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

      actual = maker.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'resolved1');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'resolved1X');
      assert.equal(actual.getValue(), expected.getValue());
      assert.deepEqual(actual, expected);
    });

    it('make() creates inheritted object just like new operator', function() {
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

      var expected = new ObjectDef('resolved1'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns('overriden_params');
      mockInjectionResolver.expects('resolve').once().withExactArgs('overriden_params').returns(['resolved1']);

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

    it('orderPerDependency() returns function, executing it calls maker and returns new instance', function() {
      mockMaker
        .expects('make')
        .once()
        .withExactArgs('impl', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var instance = orderTaker.orderPerDependency('impl', 'params')('arg1', 'arg2', 'arg3');
      assert.equal(instance, 'instance');
    });

    it('orderSingleton() returns function, executing it multiple times calls maker only once and always returns same instance', function() {
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

    it('orderNotSet() returns function, executing it throws', function() {
      var func = orderTaker.orderNotSet('impl');
      assert.throw(function() { func(); }, 'using barista in requireReg mode requires that you register "impl" using menu.withItem and specifying singleton or perDependency');
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

  describe('ItemInvokerBuilder', function() {
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
      builder = new barista.ItemInvokerBuilder(menu, invokerBuilder);
    });

    afterEach(function() {
      mockMenu.verify();
      mockInvokerBuilder.verify();
      sandbox.restore();
    });

    it('build() with no entries returns _default set to null', function() {
      var prop = new barista.Property('Name', function() {
      });
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns([]);

      assert.deepEqual(builder.build(prop), {_default: null});
    });

    it('build() with one named entry returns _default set to invoker and named set to invoker', function() {
      var entry = {
        name: 'named'
      },
          prop = new barista.Property('propname');
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns([entry]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entry).returns('invoker');

      assert.deepEqual(builder.build(prop), {_default: 'invoker', named: 'invoker'});
    });

    it('build() with one default entry returns _default set to invoker', function() {
      var entry = {
        name: '_default'
      },
          prop = new barista.Property('propname');
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns([entry]);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entry).returns('invoker');

      assert.deepEqual(builder.build(prop), {_default: 'invoker'});
    });

    it('build() with many entries without default returns default and invokers', function() {
      var entries = [
        {name: 'X'},
        {name: 'Y'},
        {name: 'Z'}
      ],
          prop = new barista.Property('propname');
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns(entries);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[2]).returns('invokerZ');

      assert.deepEqual(builder.build(prop), {_default: 'invokerX', X: 'invokerX', Y: 'invokerY', Z: 'invokerZ'});
    });

    it('build() with many entries including default returns default and invokers', function() {
      var entries = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          prop = new barista.Property('propname');
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns(entries);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[0]).returns('invoker');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[1]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[2]).returns('invokerY');

      assert.deepEqual(builder.build(prop), {_default: 'invoker', X: 'invokerX', Y: 'invokerY'});
    });

    it('build() with many entries with default in last position returns namespace with default invoker', function() {
      var entries = [
        {name: 'X'},
        {name: 'Y'},
        {name: '_default'}
      ],
          prop = new barista.Property('propname');
      mockMenu.expects('getNamespace').once().returns('ns');
      mockMenu.expects('getDefaultedEntries').withExactArgs(prop.name).once().returns(entries);
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs('ns', prop, entries[2]).returns('invoker');

      assert.deepEqual(builder.build(prop), {_default: 'invoker', X: 'invokerX', Y: 'invokerY'});
    });
  });

  describe('NamespaceBuilder', function() {
    var sandbox,
        itemBuilder,
        mockItemBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      itemBuilder = new barista.ItemInvokerBuilder();
      mockItemBuilder = sandbox.mock(itemBuilder);
      builder = new barista.NamespaceBuilder(itemBuilder);
    });

    afterEach(function() {
      mockItemBuilder.verify();
      sandbox.restore();
    });

    it('build() with zero added props returns empty namespace', function() {
      assert.deepEqual(builder.build(), {});
    });

    it('build() with one added non-object returns namespace with prop set', function() {
      var implementation = 'impl',
          prop = new barista.Property('impl', implementation);

      builder.add(prop);

      assert.deepEqual(builder.build(), {
        impl: implementation
      });
    });

    it('build() with one object returns namespace with invoker set by name', function() {
      var prop = new barista.Property('Name', function() {
      });
      mockItemBuilder.expects('build').withExactArgs(prop).once().returns({_default: 'invoker'});

      builder.add(prop);

      assert.deepEqual(builder.build(), {Name: 'invoker'});
    });

    it('build() with many objects returns namespace with invokers set by name', function() {
      var prop1 = new barista.Property('Name1', function() {
      }),
          prop2 = new barista.Property('Name2', function() {
          }),
          prop3 = new barista.Property('Name3', function() {
          });

      mockItemBuilder.expects('build').withExactArgs(prop1).once().returns({_default: 'invoker1'});
      mockItemBuilder.expects('build').withExactArgs(prop2).once().returns({_default: 'invoker2'});
      mockItemBuilder.expects('build').withExactArgs(prop3).once().returns({_default: 'invoker3'});

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

    it('process() with zero properties returns namespace and return build return value', function() {
      mockBuilder.expects('build').once().returns('namespace');
      assert.equal(processor.process({}), 'namespace');
    });

    it('process() with one property adds property to namespace and returns build return value', function() {
      mockExtractor.expects('extract').withExactArgs('prop1').once().returns('extracted1');
      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(processor.process({
        prop1: 1
      }), 'namespace');
    });

    it('process() with many properties adds each to namespace and returns build return value', function() {
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

    it('process() only calls add with own properties and returns build return value', function() {
      function nsSuper() {
        this.valueNotOwn = 0;
      }
      function ns() {
        this.own1 = 1;
      }
      ns.prototype = new nsSuper();

      mockExtractor.expects('extract').withExactArgs('own1').once().returns('extracted1');
      mockBuilder.expects('add').withExactArgs('extracted1').once();
      mockBuilder.expects('build').once().returns('namespace');

      assert.deepEqual(processor.process(new ns()), 'namespace');
    });
  });

  describe('Barista', function() {
    beforeEach(function() {
      barista = new Barista();
    });

    it('serve() with no menuFunc defaults menu', function() {
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
          servedNs = barista.serve(new nsSimple('depends'), function(menu) {
            menu.withItem('ObjDef2').singleton();
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
          servedUtilsNs = barista.serve(new nsUtils(), function(menu) {
            menu.forNamespace('Utils');
            menu.withItem('addAlternatingChar').withValueParam('default').withValueParam(' ');
            menu.withItem('Tester').named('notdefault').withValueParam('uses _default');
            menu.withItem('Prepender').withValueParam('-');
            menu.withItem('Prepender').named('special').withValueParam('special');
            menu.withItem('Capitalizer').singleton();
            menu
              .withItem('ChainOfResponsibilities')
              .named('widget1Controller')
              .withArrayParam(function(params) {
                params
                  .withResolveParam('Responsibilities.PrependResponsibility')
                  .withResolveParam('Responsibilities.AppendPlusesResponsibility.p3')
                  .withResolveParam('Responsibilities.WrapResponsibility');
              });
            menu
              .withItem('ChainOfResponsibilities')
              .named('widget2Controller')
              .withArrayParam(function(params) {
                params
                  .withResolveParam('Responsibilities.PrependAndCapitalizeResponsibility')
                  .withResolveParam('Responsibilities.AppendPlusesResponsibility.p1')
                  .withResolveParam('Responsibilities.WrapResponsibility');
              });
          }),
          servedWidgetNs = barista.serve(new nsWidget(), function(menu) {
            menu.forNamespace('Widget');
            menu.withItem('Widget1').withResolveParam('Utils.ChainOfResponsibilities.widget1Controller');
            menu.withItem('Widget2').withResolveParam('Utils.ChainOfResponsibilities.widget2Controller');
          });

      barista.serve(new nsResponsibilities(), function(menu) {
        menu.forNamespace('Responsibilities');
        menu.withItem('PrependResponsibility').withResolveParam('Utils.Prepender');
        menu.withItem('PrependAndCapitalizeResponsibility').withResolveParam('Utils.Prepender').withResolveParam('Utils.Capitalizer');
        menu.withItem('AppendPlusesResponsibility').named('p3').withValueParam(3);
        menu.withItem('AppendPlusesResponsibility').named('p1').withValueParam(1);
      });

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

    it('serve() and make() using standard namespace using this pointer', function() {
      var ns = function() {
        this.ObjDef = function(arg1) { this.x = arg1; };
      },
          servedNs = barista.serve(new ns(), function(menu) {
            menu
              .forNamespace('Simple')
              .withItem('ObjDef').withValueParam('param1');
          });
      assert.equal(servedNs.ObjDef().x, 'param1');
      assert.equal(barista.make('Simple.ObjDef').x, 'param1');
    });

    it('serve() and make() throw when using requireReg mode when using not fully registered object', function() {
      barista = new Barista({requireReg: true});
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
          servedNs = barista.serve(new nsSimple(), function(menu) {
            menu.forNamespace('Simple');
            menu.withItem('ObjNoType');
            menu.withItem('ObjDependentUponObjNoRegistration').perDependency().withResolveParam('Simple.ObjNoRegistration');
          });

      assert.throw(function() { servedNs.ObjNoRegistration(); }, 'using barista in requireReg mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying singleton or perDependency');
      assert.throw(function() { servedNs.ObjNoType(); }, 'using barista in requireReg mode requires that you register "function ObjNoType() { return {}; }" using menu.withItem and specifying singleton or perDependency');
      assert.throw(function() { servedNs.ObjDependentUponObjNoRegistration(); }, 'using barista in requireReg mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying singleton or perDependency');
      assert.throw(function() { barista.make('Simple.ObjNoRegistration'); }, 'using barista in requireReg mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying singleton or perDependency');
      assert.throw(function() { barista.make('Simple.ObjNoType'); }, 'using barista in requireReg mode requires that you register "function ObjNoType() { return {}; }" using menu.withItem and specifying singleton or perDependency');
      assert.throw(function() { barista.make('Simple.ObjDependentUponObjNoRegistration'); }, 'using barista in requireReg mode requires that you register "function ObjNoRegistration() { return {}; }" using menu.withItem and specifying singleton or perDependency');
    });

    it('serveObject() registers one object and returns invokers', function() {
      var ObjDef = function(arg1) { return {value: arg1}; },
          invokers = barista.serveObject(ObjDef, 'ObjDef', function(menu) {
            menu.forNamespace('AdHoc');
            menu.withItem('ObjDef').withValueParam('param1').perDependency();
            menu.withItem('ObjDef').named('two').withValueParam('param2').singleton();
          });

      assert.equal(invokers._default().value, 'param1');
      assert.equal(invokers.two().value, 'param2');
      assert.equal(barista.make('AdHoc.ObjDef._default').value, 'param1');
      assert.equal(barista.make('AdHoc.ObjDef.two').value, 'param2');
    });
  });
});