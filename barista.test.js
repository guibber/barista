describe('barista Tests', function() {
  describe('IncludedNamespace', function() {
    it('IncludedNamespace() set properties', function() {
      var namespace = new barista.IncludedNamespace('name', 'instance');
      assert.equal(namespace.name, 'name');
      assert.equal(namespace.instance, 'instance');
    });
  });

  describe('NamespaceNameGenerator', function() {
    it('generate() returns Namespace1 then increments', function() {
      var generator = new barista.NamespaceNameGenerator();
      assert.equal(generator.generate(), 'Namespace1');
      assert.equal(generator.generate(), 'Namespace2');
      assert.equal(generator.generate(), 'Namespace3');
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

    it('withParam() sets func param and returns this', function() {
      stubNewParamFunc.withArgs('func', 'value').returns('param');
      assert.deepEqual(params.withParam('value').value, ['param']);
    });

    it('withArrayParam() sets array param, calls addArrayParamsFunc and returns this', function() {
      var stubArrayParamsFunc = sandbox.stub();
      stubNewParamsFunc.returns('params');
      stubArrayParamsFunc.withArgs('params');
      assert.deepEqual(params.withArrayParam(stubArrayParamsFunc).value, ['params']);
    });

    it('withResolveParam() sets resolve param and returns this', function() {
      stubNewParamFunc.withArgs('resolve', 'value').returns('param');
      assert.deepEqual(params.withResolveParam('value').value, ['param']);
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

    it('withParam() sets func param', function() {
      mockParams.expects('withParam').once().withExactArgs('value');
      assert.equal(entry.withParam('value'), entry);
    });

    it('withResolveParam() sets resolve param and returns this', function() {
      mockParams.expects('withResolveParam').once().withExactArgs('value');
      assert.equal(entry.withResolveParam('value'), entry);
    });

    it('withArrayParam() sets array param', function() {
      mockParams.expects('withArrayParam').once().withExactArgs('addFunc');
      assert.equal(entry.withArrayParam('addFunc'), entry);
    });
  });

  describe('EntryBuilder', function() {
    var sandbox,
        stubNewEntryFunc,
        defaulter;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stubNewEntryFunc = sandbox.stub();
      stubNewEntryFunc.returns({});
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('build() return default with requireReg false returns perDependency type', function() {
      defaulter = new barista.EntryBuilder(stubNewEntryFunc);
      assert.deepEqual(defaulter.build(), {
        type: 'perdependency',
        name: '_default',
        params: []
      });
    });

    it('build() return default with requireReg true returns not_set type', function() {
      defaulter = new barista.EntryBuilder(stubNewEntryFunc, true);
      assert.deepEqual(defaulter.build(), {
        type: 'not_set',
        name: '_default',
        params: []
      });
    });
  });

  describe('Entries', function() {
    var sandbox,
        entryBuilder,
        mockEntryBuilder,
        entries;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      entryBuilder = new barista.EntryBuilder();
      mockEntryBuilder = sandbox.mock(entryBuilder);
      entries = new barista.Entries(entryBuilder);
    });

    afterEach(function() {
      mockEntryBuilder.verify();
      sandbox.restore();
    });

    it('getEntries() returns empty array by default', function() {
      assert.deepEqual(entries.getEntries(), []);
    });

    it('reset() empties entries', function() {
      entries.getEntries().push(1);
      entries.reset();
      assert.deepEqual(entries.getEntries(), []);
    });

    it('withEntry() creates entry includes in entries array and returns entry', function() {
      mockEntryBuilder.expects('build').once().returns('entry');
      assert.equal(entries.withEntry(), 'entry');
      assert.deepEqual(entries.getEntries(), ['entry']);
    });

  });

  describe('Property', function() {
    it('Property() sets namespace, name and implementation properties', function() {
      var property = new barista.Property('namespace', 'name', 'implementation');

      assert.equal(property.namespace, 'namespace');
      assert.equal(property.name, 'name');
      assert.equal(property.implementation, 'implementation');
    });

    it('isObject() returns true for functions', function() {
      var objectDef = function() {
      };
      assert.isTrue(new barista.Property(null, null, objectDef).isObject());
    });

    it('isObject() returns false for all other types', function() {
      var bool = true;
      var number = 1;
      var str = 'string';
      var date = new Date();
      var obj = {};

      assert.isFalse(new barista.Property(null, null, bool).isObject());
      assert.isFalse(new barista.Property(null, null, number).isObject());
      assert.isFalse(new barista.Property(null, null, str).isObject());
      assert.isFalse(new barista.Property(null, null, date).isObject());
      assert.isFalse(new barista.Property(null, null, obj).isObject());
      assert.isFalse(new barista.Property(null, null, null).isObject());
      assert.isFalse(new barista.Property(null, null).isObject());
    });
  });

  describe('PropertyExtractor', function() {
    it('extract() call newPropFunc with namespace, name and implementation', function() {
      var namespace = {
        instance: {
          prop1: 'implementation'
        }
      },
          stubNewProp = sinon.stub(),
          extractor = new barista.PropertyExtractor(stubNewProp);

      stubNewProp.withArgs(namespace, 'prop1', 'implementation').returns('property');

      assert.equal(extractor.extract(namespace, 'prop1'), 'property');
    });
  });

  describe('InvokersMapper', function() {
    var invokersOneDefault,
        invokersManyDefault;

    beforeEach(function() {
      invokersOneDefault = {
        ns: {
          item: {
            '_default': 'invoker',
            '_definition': 'implementation'
          }
        }
      };

      invokersManyDefault = {
        ns1: {
          item1: {
            '_default': 'invoker',
            '_definition': 'implementation'
          }
        },
        ns2: {
          item2: {
            '_default': 'invoker',
            '_definition': 'implementation'
          }
        },
        ns3: {
          item3: {
            '_default': 'invoker',
            '_definition': 'implementation'
          }
        }
      };
    });

    it('find() on empty items and entries returns null', function() {
      assert.equal(new barista.InvokersMapper({}).find('ns', 'item'), null);
    });

    it('find() with one item and one entry returns matched invoker', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'item', '_default'), 'invoker');
    });
    
    it('find() with one item and one entry returns matched implementation', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'item', '_definition'), 'implementation');
    });

    it('find() with one item and many entries returns matched invoker', function() {
      invokersOneDefault.ns.item.other1 = 'x';
      invokersOneDefault.ns.item.other2 = 'x';
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'item', '_default'), 'invoker');
    });

    it('find() with one item and one entry returns match by defaulting entry param', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'item'), 'invoker');
    });

    it('find() with one item and one entry returns returns null when no entry name match', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'item', 'notfound'), null);
    });

    it('find() with one item and one entry returns null when no item match', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('ns', 'itemNoMatch'), null);
    });

    it('find() with one item and one entry returns null when no namespace match', function() {
      assert.equal(new barista.InvokersMapper(invokersOneDefault).find('nsNoMatch'), null);
    });

    it('find() with many items and entries returns match', function() {
      assert.equal(new barista.InvokersMapper(invokersManyDefault).find('ns1', 'item1', '_default'), 'invoker');
    });

    it('find() with many items and entries returns null when no entry name match', function() {
      assert.equal(new barista.InvokersMapper(invokersManyDefault).find('ns1', 'item1', 'notfound'), null);
    });

    it('find() with many items and entries returns null when no item match', function() {
      assert.equal(new barista.InvokersMapper(invokersManyDefault).find('ns1', 'noItemMatch'), null);
    });

    it('find() with many items and entries returns null when no namespace match', function() {
      assert.equal(new barista.InvokersMapper(invokersManyDefault).find('nsNoMatch'), null);
    });

    it('map() with no items and entries sets _default and named entry to invoker', function() {
      var invokersMapper = new barista.InvokersMapper({});
      invokersOneDefault.ns.item.name = 'invoker';

      invokersMapper.map('ns', 'item', 'name', 'invoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with no items and entries, with null entry name defaults entry name to _default and sets', function() {
      var invokersMapper = new barista.InvokersMapper({});
      invokersMapper.map('ns', 'item', null, 'invoker', 'implementation');
      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with one item and entry using non-default entry name sets entry, but does not overwrite existing _default', function() {
      var invokersMapper = new barista.InvokersMapper(copy(invokersOneDefault));
      invokersOneDefault.ns.item.notDefault = 'invoker2';

      invokersMapper.map('ns', 'item', "notDefault", 'invoker2', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with one item and existing entry overwrites entry name', function() {
      var map = copy(invokersOneDefault),
          invokersMapper;
      map.ns.item.existingName = 'existingInvoker';
      invokersMapper = new barista.InvokersMapper(map);
      invokersOneDefault.ns.item.existingName = 'overwrittenInvoker';

      invokersMapper.map('ns', 'item', 'existingName', 'overwrittenInvoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with one item and entry maps correctly', function() {
      var invokersMapper = new barista.InvokersMapper(copy(invokersOneDefault));
      invokersOneDefault.ns1 = {
        item1: {
          _default: 'invoker',
          _definition: 'implementation',
          name: 'invoker'
        }
      };

      invokersMapper.map('ns1', 'item1', 'name', 'invoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with one item and many existing entry names maps correctly', function() {
      var map = copy(invokersOneDefault),
          invokersMapper;
      map.ns.item.existing = invokersOneDefault.ns.item.existing = 'existing';
      invokersMapper = new barista.InvokersMapper(map);
      invokersOneDefault.ns.item.entryname = 'invoker';

      invokersMapper.map('ns', 'item', 'entryname', 'invoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersOneDefault);
    });

    it('map() with many items and many entries maps new item and entry correctly', function() {
      var invokersMapper = new barista.InvokersMapper(copy(invokersManyDefault));
      invokersManyDefault.ns = {
        item: {
          _default: 'invoker',
          _definition: 'implementation',
          entry: 'invoker'
        }
      };

      invokersMapper.map('ns', 'item', 'entry', 'invoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersManyDefault);
    });

    it('map() with many items and entries maps additional entry name on existing item', function() {
      var invokersMapper = new barista.InvokersMapper(copy(invokersManyDefault));
      invokersManyDefault.ns1.item1.entry = 'invoker';

      invokersMapper.map('ns1', 'item1', 'entry', 'invoker', 'implementation');

      assert.deepEqual(invokersMapper.invokers, invokersManyDefault);
    });
  });

  describe('ArgsOverrider', function() {
    var sandbox,
        paramsResolver,
        mockParamsResolver,
        paramResolver,
        mockParamResolver,
        overrider;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      paramsResolver = new barista.ParamsResolver();
      mockParamsResolver = sandbox.mock(paramsResolver);
      paramResolver = new barista.ParamResolver();
      mockParamResolver = sandbox.mock(paramResolver);
      overrider = new barista.ArgsOverrider(paramsResolver, paramResolver);
    });

    afterEach(function() {
      mockParamsResolver.verify();
      mockParamResolver.verify();
      sandbox.restore();
    });

    it('override() with null args and null params returns empty array', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(), []);
    });

    it('override() with empty args and empty params returns empty array', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override([], []), []);
    });

    it('override() with one arg and empty params returns arg', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override([], ['arg1']), ['arg1']);
    });

    it('override() with many args and empty params returns args', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override([], ['arg1', 'arg2', 'arg3']), ['arg1', 'arg2', 'arg3']);
    });

    it('override() with empty args and one param returns resolved param', function() {
      mockParamsResolver.expects('resolve').once().withExactArgs(['param']).returns('resolvedParamInArray');
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param'], []), 'resolvedParamInArray');
    });

    it('override() with empty args and many params returns resolved params', function() {
      mockParamsResolver.expects('resolve').once().withExactArgs(['param1', 'param2', 'param3']).returns('resolvedParamsInArray');
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], []), 'resolvedParamsInArray');
    });

    it('override() with one arg and many params returns overriden arg and remainder of resolved params', function() {
      mockParamResolver.expects('resolve').once().withExactArgs('param2').returns('resolvedParam2');
      mockParamResolver.expects('resolve').once().withExactArgs('param3').returns('resolvedParam3');
      mockParamsResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1']), [
        'arg1',
        'resolvedParam2',
        'resolvedParam3'
      ]);
    });

    it('override() with many args and many params returns overriden args', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3']), ['arg1', 'arg2', 'arg3']);
    });

    it('override() with less args and many params returns overriden args and remaining resolved param', function() {
      mockParamResolver.expects('resolve').once().withExactArgs('param3').returns('resolvedParam3');
      mockParamsResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2']), [
        'arg1',
        'arg2',
        'resolvedParam3'
      ]);
    });

    it('override() with more args and many params returns all args', function() {
      mockParamsResolver.expects('resolve').never();
      mockParamResolver.expects('resolve').never();
      assert.deepEqual(overrider.override(['param1', 'param2', 'param3'], ['arg1', 'arg2', 'arg3', 'arg4']), ['arg1', 'arg2', 'arg3', 'arg4']);
    });
  });

  describe('ResolveKey', function() {
    it('ResolveKey() sets namespace, item, and name properties when all present in id', function() {
      var key = new barista.ResolveKey('ns.item.entry');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.item, 'item');
      assert.equal(key.entry, 'entry');
    });

    it('ResolveKey() sets namespace and item, and entry is defaulted to _default when absent', function() {
      var key = new barista.ResolveKey('ns.item');
      assert.equal(key.namespace, 'ns');
      assert.equal(key.item, 'item');
      assert.equal(key.entry, '_default');
    });
  });

  describe('ParamsResolver', function() {
    var sandbox,
        paramResolver,
        mockParamResolver,
        resolver;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      paramResolver = new barista.ParamResolver();
      mockParamResolver = sandbox.mock(paramResolver);
      resolver = new barista.ParamsResolver(paramResolver);
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

  describe('ParamResolver', function() {
    var sandbox,
        invokersMapper,
        mockInvokersMapper,
        stubNewParamsResolver,
        paramsResolver,
        mockParamsResolver,
        resolver;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      invokersMapper = new barista.InvokersMapper();
      mockInvokersMapper = sandbox.mock(invokersMapper);
      stubNewParamsResolver = sandbox.stub();
      paramsResolver = new barista.ParamsResolver();
      mockParamsResolver = sandbox.mock(paramsResolver);
      resolver = new barista.ParamResolver(invokersMapper, stubNewParamsResolver);
    });

    afterEach(function() {
      mockInvokersMapper.verify();
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
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', '_default').returns(invoker);
      assert.equal(resolver.resolve({type: 'resolve', value: 'ns.item'}), 'invoked');
    });

    it('resolve() with non-existing resolve param returns null', function() {
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', '_default').returns(null);
      assert.isNull(resolver.resolve({type: 'resolve', value: 'ns.item'}));
    });

    it('resolve() with array of params returns resolved array', function() {
      var paramArray = [
        {type: 'resolve', value: 'ns.Object1'},
        {type: 'value', value: 'value'},
        {type: 'resolve', value: 'ns.Object2'}
      ];
      stubNewParamsResolver.withArgs(resolver).returns(paramsResolver);
      mockParamsResolver.expects('resolve').once().withExactArgs(paramArray).returns('array_resolved');

      assert.equal(resolver.resolve({type: 'array', value: paramArray}), 'array_resolved');
    });
  });

  describe('Factory', function() {
    var sandbox,
        argsOverrider,
        mockArgsOverrider,
        factory;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      argsOverrider = new barista.ArgsOverrider();
      mockArgsOverrider = sandbox.mock(argsOverrider);
      factory = new barista.Factory(argsOverrider);
    });

    afterEach(function() {
      mockArgsOverrider.verify();
      sandbox.restore();
    });

    it('make() creates anonymous object like new operator', function() {
      var ObjectDef = function(arg1) {
        return {value1: arg1};
      },
          expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates named object like new operator', function() {
      function ObjectDef(arg1) {
        return {value1: arg1};
      }
      var expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates anonymous object using "this" just like new operator', function() {
      var ObjectDef = function(arg1) {
        this.value1 = arg1;
      },
          expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.deepEqual(actual, expected);
    });

    it('make() creates named object using "this" just like new operator', function() {
      function ObjectDef(arg1) {
        this.value1 = arg1;
      }
      var expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

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
      var expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'applyArgs');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'applyArgsX');
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
      var expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'applyArgs');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'applyArgsX');
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

      var expected = new ObjectDef('applyArgs'),
          actual;
      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      actual = factory.make(ObjectDef, ['param1'], ['arg1']);

      assert.equal(actual.value1, 'applyArgs');
      assert.equal(actual.value1, expected.value1);
      assert.equal(actual.prototype, expected.prototype);
      assert.equal(actual.getValue(), 'applyArgsX');
      assert.equal(actual.getValue(), expected.getValue());
      assert.deepEqual(actual, expected);
    });

    it('make() on function returns execution result', function() {
      var someFunc = function(args1) {
        return args1;
      };

      mockArgsOverrider.expects('override').once().withExactArgs(['param1'], ['arg1']).returns(['applyArgs']);

      assert.equal(factory.make(someFunc, ['param1'], ['arg1']), 'applyArgs');
    });
  });

  describe('InvokerTypeBuilder', function() {
    var sandbox,
        factory,
        mockFactory,
        typeBuilder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      factory = new barista.Factory();
      mockFactory = sandbox.mock(factory);
      typeBuilder = new barista.InvokerTypeBuilder(factory);
    });

    afterEach(function() {
      mockFactory.verify();
      sandbox.restore();
    });

    it('buildPerDependency() returns function, executing it calls factory and returns new instance', function() {
      mockFactory
        .expects('make')
        .once()
        .withExactArgs('impl', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var instance = typeBuilder.buildPerDependency('impl', 'params')('arg1', 'arg2', 'arg3');
      assert.equal(instance, 'instance');
    });

    it('buildSingleton() returns function, executing it multiple times calls factory only once and always returns same instance', function() {
      mockFactory
        .expects('make')
        .once()
        .withExactArgs('impl', 'params', match({0: "arg1", 1: "arg2", 2: "arg3"}))
        .returns('instance');

      var func = typeBuilder.buildSingleton('impl', 'params');
      var instance = func('arg1', 'arg2', 'arg3');
      var instance2 = func('argOther');
      assert.equal(instance, 'instance');
      assert.equal(instance, instance2);
    });

    it('buildNotSet() returns function, executing it throws', function() {
      var func = typeBuilder.buildNotSet('impl');
      assert.throw(function() { func(); }, 'using barista in requireReg mode requires that you register "impl" and specify singleton or perDependency');
    });
  });

  describe('InvokerBuilder', function() {
    var sandbox,
        typeBuilder,
        mockInvokerTypeBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      typeBuilder = new barista.InvokerTypeBuilder();
      mockInvokerTypeBuilder = sandbox.mock(typeBuilder);
      builder = new barista.InvokerBuilder(typeBuilder);
    });

    afterEach(function() {
      mockInvokerTypeBuilder.verify();
      sandbox.restore();
    });

    it('build() creates perdep invoker and returns', function() {
      mockInvokerTypeBuilder.expects("buildPerDependency").withExactArgs('implementation', 'params').once().returns('invoker');
      assert.equal(builder.build({implementation: 'implementation'}, {type: 'perdependency', name: 'itemName', params: 'params'}), 'invoker');
    });

    it('build() creates singleton invoker returns', function() {
      mockInvokerTypeBuilder.expects("buildSingleton").withExactArgs('implementation', 'params').once().returns('invoker');
      assert.equal(builder.build({implementation: 'implementation'}, {type: 'singleton', name: 'itemName', params: 'params'}), 'invoker');
    });

    it('build() creates not_set invoker and returns', function() {
      mockInvokerTypeBuilder.expects("buildNotSet").withExactArgs('implementation', 'params').once().returns('invoker');
      assert.equal(builder.build({implementation: 'implementation'}, {type: 'not_set', name: 'itemName', params: 'params'}), 'invoker');
    });
  });

  describe('InvokerMapBuilder', function() {
    var sandbox,
        invokersMapper,
        mockInvokersMapper,
        invokerBuilder,
        mockInvokerBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      invokersMapper = new barista.InvokersMapper();
      mockInvokersMapper = sandbox.mock(invokersMapper);
      invokerBuilder = new barista.InvokerBuilder();
      mockInvokerBuilder = sandbox.mock(invokerBuilder);
      builder = new barista.InvokerMapBuilder(invokerBuilder, invokersMapper);
    });

    afterEach(function() {
      mockInvokersMapper.verify();
      mockInvokerBuilder.verify();
      sandbox.restore();
    });

    it('build() with no entries does nothing', function() {
      mockInvokersMapper.expects('map').never();
      mockInvokerBuilder.expects('build').never();
      builder.build(null, []);
    });

    it('build() with one default named entry maps _default to invoker', function() {
      var entry = {
        name: '_default'
      },
          prop = new barista.Property(new barista.IncludedNamespace('nsName'), 'propName', 'implementation');
      
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entry).returns('invoker');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', '_default', 'invoker', 'implementation');
      builder.build(prop, [entry]);
    });

    it('build() with one named entry maps named entry and _default to invoker', function() {
      var entry = {
        name: 'entryName'
      },
          prop = new barista.Property(new barista.IncludedNamespace('nsName'), 'propName', 'implementation');

      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entry).returns('invoker');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'entryName', 'invoker', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', '_default', 'invoker', 'implementation');
      builder.build(prop, [entry]);
    });

    it('build() with many entries without default maps default and named', function() {
      var entries = [
        {name: 'X'},
        {name: 'Y'},
        {name: 'Z'}
      ],
          prop = new barista.Property(new barista.IncludedNamespace('nsName'), 'propName', 'implementation');

      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[2]).returns('invokerZ');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'X', 'invokerX', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'Y', 'invokerY', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'Z', 'invokerZ', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', '_default', 'invokerX', 'implementation');

      builder.build(prop, entries);
    });

    it('build() with many entries including default maps default and named', function() {
      var entries = [
        {name: '_default'},
        {name: 'X'},
        {name: 'Y'}
      ],
          prop = new barista.Property(new barista.IncludedNamespace('nsName'), 'propName', 'implementation');

      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[0]).returns('invoker');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[1]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[2]).returns('invokerY');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', '_default', 'invoker', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'X', 'invokerX', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'Y', 'invokerY', 'implementation');

      builder.build(prop, entries);
    });

    it('build() with many entries with default in last position maps default and named', function() {
      var entries = [
        {name: 'X'},
        {name: 'Y'},
        {name: '_default'}
      ],
          prop = new barista.Property(new barista.IncludedNamespace('nsName'), 'propName', 'implementation');

      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[0]).returns('invokerX');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[1]).returns('invokerY');
      mockInvokerBuilder.expects('build').once().withExactArgs(prop, entries[2]).returns('invoker');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', '_default', 'invoker', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'X', 'invokerX', 'implementation');
      mockInvokersMapper.expects('map').once().withExactArgs('nsName', 'propName', 'Y', 'invokerY', 'implementation');

      builder.build(prop, entries);
    });
  });

  describe('Resolver', function() {
    var sandbox,
        invokersMapper,
        mockInvokersMapper,
        resolver;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      invokersMapper = new barista.InvokersMapper();
      mockInvokersMapper = sandbox.mock(invokersMapper);
      resolver = new barista.Resolver(invokersMapper);
    });

    afterEach(function() {
      mockInvokersMapper.verify();
      sandbox.restore();
    });

    it('resolve() not finding invoker returns null', function() {
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', 'entry').returns(null);
      assert.equal(resolver.resolve('ns.item.entry'), null);
    });

    it('resolve() with zero args returns invoked', function() {
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', 'entry').returns(function() { return 'invoked'; });
      assert.equal(resolver.resolve('ns.item.entry'), 'invoked');
    });

    it('resolve() with one args returns invoked called with arg', function() {
      var stubInvoker = sinon.stub();
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', 'entry').returns(stubInvoker);
      stubInvoker.withArgs('arg').returns('invoked');
      assert.equal(resolver.resolve('ns.item.entry', 'arg'), 'invoked');
    });

    it('resolve() with many args returns invoked called with args', function() {
      var stubInvoker = sinon.stub();
      mockInvokersMapper.expects('find').once().withExactArgs('ns', 'item', 'entry').returns(stubInvoker);
      stubInvoker.withArgs('arg1', 'arg2', 'arg3').returns('invoked');
      assert.equal(resolver.resolve('ns.item.entry', 'arg1', 'arg2', 'arg3'), 'invoked');
    });
  });

  describe('PropEntriesRegistrar', function() {
    var sandbox,
        invokersMapper,
        invokerMapBuilder,
        mockInvokerMapBuilder,
        entries,
        mockEntries,
        registrar;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      invokersMapper = barista.InvokersMapper('items');
      invokerMapBuilder = new barista.InvokerMapBuilder();
      mockInvokerMapBuilder = sandbox.mock(invokerMapBuilder);
      entries = new barista.Entries();
      mockEntries = sandbox.mock(entries);
      registrar = new barista.PropEntriesRegistrar(invokerMapBuilder, invokersMapper, 'resolver', 'prop', entries);
    });

    afterEach(function() {
      mockInvokerMapBuilder.verify();
      mockEntries.verify();
      sandbox.restore();
    });

    it('PropEntriesRegistrar() sets prop property', function() {
      assert.equal(registrar.prop, 'prop');
    });

    it('register() resets entries array, calls supplied function with args, and builds', function() {
      var stubEntriesFunc = sinon.stub();
      mockEntries.expects('reset').once();
      stubEntriesFunc.withArgs(entries, 'items', 'resolver');
      mockEntries.expects('getEntries').once().returns('entries');
      mockInvokerMapBuilder.expects('build').once().withExactArgs('prop', 'entries');
      registrar.register(stubEntriesFunc);
    });
  });

  describe('PropEntriesRegistrarBuilder', function() {
    it('build() resets entries array, calls supplied function with args, and builds', function() {
      var stubNewEntriesFunc = sinon.stub(),
          stubNewPropEntriesRegistrarFunc = sinon.stub();

      stubNewEntriesFunc.returns('newEntries');
      stubNewPropEntriesRegistrarFunc.withArgs('invokerMapBuilder', 'invokersMapper', 'resolver', 'prop', 'newEntries').returns('newPropEntriesRegistrar');
      assert.equal(new barista.PropEntriesRegistrarBuilder('invokerMapBuilder', 'invokersMapper', 'resolver', stubNewEntriesFunc, stubNewPropEntriesRegistrarFunc).build('prop'), 'newPropEntriesRegistrar');
    });
  });


  describe('NamespaceRegistrarBuilder', function() {
    var sandbox,
        extractor,
        mockExtractor,
        registrarBuilder,
        mockRegistrarBuilder,
        registrar1,
        mockRegistrar1,
        registrar2,
        mockRegistrar2,
        registrar3,
        mockRegistrar3,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      extractor = new barista.PropertyExtractor();
      mockExtractor = sandbox.mock(extractor);
      registrarBuilder = new barista.PropEntriesRegistrarBuilder();
      mockRegistrarBuilder = sandbox.mock(registrarBuilder);
      registrar1 = new barista.PropEntriesRegistrar();
      mockRegistrar1 = sandbox.mock(registrar1);
      registrar2 = new barista.PropEntriesRegistrar();
      mockRegistrar2 = sandbox.mock(registrar2);
      registrar3 = new barista.PropEntriesRegistrar();
      mockRegistrar3 = sandbox.mock(registrar3);
      builder = new barista.NamespaceRegistrarBuilder(extractor, registrarBuilder);
    });

    afterEach(function() {
      mockExtractor.verify();
      mockRegistrarBuilder.verify();
      mockRegistrar1.verify();
      mockRegistrar2.verify();
      mockRegistrar3.verify();
      sandbox.restore();
    });

    it('build() with no props in namespace returns empty', function() {
      var namespace = new barista.IncludedNamespace({});
      assert.deepEqual(builder.build(namespace), {});
    });

    it('build() with one prop extracts prop, sets prop registrar and adds default entry', function() {
      var namespace = new barista.IncludedNamespace(null, {prop1: 'prop1'}),
          prop1 = new barista.Property(namespace, 'prop1', null);
      mockExtractor.expects('extract').once().withExactArgs(namespace, 'prop1').returns(prop1);
      mockRegistrarBuilder.expects('build').once().withExactArgs(prop1).returns(registrar1);
      mockRegistrar1.expects('register').once().withExactArgs(builder.addDefaultEntry);
      assert.deepEqual(builder.build(namespace), {prop1: registrar1});
    });

    it('build() with one prop does nothing when not hasOwnProperty', function() {
      var namespace = new barista.IncludedNamespace(null, {
        hasOwnProperty: function() {
          return false;
        }
      });
      assert.deepEqual(builder.build(namespace), {});
    });

    it('build() with many props extracts props, sets props registrars and adds default entry to each', function() {
      var namespace = new barista.IncludedNamespace(null, {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      }),
          prop1 = new barista.Property(namespace, 'prop1', null),
          prop2 = new barista.Property(namespace, 'prop2', null),
          prop3 = new barista.Property(namespace, 'prop3', null);
      mockExtractor.expects('extract').once().withExactArgs(namespace, 'prop1').returns(prop1);
      mockExtractor.expects('extract').once().withExactArgs(namespace, 'prop2').returns(prop2);
      mockExtractor.expects('extract').once().withExactArgs(namespace, 'prop3').returns(prop3);
      mockRegistrarBuilder.expects('build').once().withExactArgs(prop1).returns(registrar1);
      mockRegistrarBuilder.expects('build').once().withExactArgs(prop2).returns(registrar2);
      mockRegistrarBuilder.expects('build').once().withExactArgs(prop3).returns(registrar3);
      mockRegistrar1.expects('register').once().withExactArgs(builder.addDefaultEntry);
      mockRegistrar2.expects('register').once().withExactArgs(builder.addDefaultEntry);
      mockRegistrar3.expects('register').once().withExactArgs(builder.addDefaultEntry);
      assert.deepEqual(builder.build(namespace), {
        prop1: registrar1,
        prop2: registrar2,
        prop3: registrar3
      });
    });

    it('build() with many props only extracts hasOwnProperty properties', function() {
      var stubHasOwnProperty = sinon.stub(),
          namespace = new barista.IncludedNamespace(null, {
            prop1: 'prop1',
            prop2: 'prop2',
            prop3: 'prop3',
            hasOwnProperty: stubHasOwnProperty
          }),
          prop2 = new barista.Property(namespace, 'prop2', null);

      stubHasOwnProperty.withArgs('prop1').returns(false);
      stubHasOwnProperty.withArgs('prop2').returns(true);
      stubHasOwnProperty.withArgs('prop3').returns(false);
      stubHasOwnProperty.withArgs('hasOwnProperty').returns(false);
      mockExtractor.expects('extract').once().withExactArgs(namespace, 'prop2').returns(prop2);
      mockRegistrarBuilder.expects('build').once().withExactArgs(prop2).returns(registrar2);
      mockRegistrar2.expects('register').once().withExactArgs(builder.addDefaultEntry);

      assert.deepEqual(builder.build(namespace), {
        prop2: registrar2
      });
    });
  });

  describe('NamespaceIncluder', function() {
    var sandbox,
        generator,
        mockGenerator,
        registrarBuilder,
        mockRegistrarBuilder,
        includer;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      generator = new barista.NamespaceNameGenerator();
      mockGenerator = sandbox.mock(generator);
      registrarBuilder = new barista.NamespaceRegistrarBuilder();
      mockRegistrarBuilder = sandbox.mock(registrarBuilder);
      includer = new barista.NamespaceIncluder(generator, registrarBuilder);
    });

    afterEach(function() {
      mockGenerator.verify();
      mockRegistrarBuilder.verify();
      sandbox.restore();
    });

    it('NamespaceIncluder() sets registrations property to empty object', function() {
      assert.deepEqual(includer.registrations, {});
    });

    it('include() without name generates namespace name, sets registration and returns this', function() {
      mockGenerator.expects('generate').once().returns('generated');
      mockRegistrarBuilder.expects('build').once().withExactArgs(new barista.IncludedNamespace('generated', 'namespace')).returns('registrar');
      assert.deepEqual(includer.include('namespace').registrations, {generated: 'registrar'});
    });

    it('include() with name sets registration and returns this', function() {
      mockRegistrarBuilder.expects('build').once().withExactArgs(new barista.IncludedNamespace('name', 'namespace')).returns('registrar');
      assert.deepEqual(includer.include('namespace', 'name').registrations, {name: 'registrar'});
    });
  });

  describe('OutputPropBuilder', function() {
    var builder;

    beforeEach(function() {
      builder = new barista.OutputPropBuilder();
    });

    it('build() when prop is object returns invoker default', function() {
      var registration = {
        prop: {
          isObject: function() {
            return true;
          }
        }
      },
          invokers = {
            _default: 'invoker'
          };
      assert.equal(builder.build(registration, invokers), 'invoker');
    });

    it('build() when prop is not object returns prop implementation', function() {
      var registration = {
        prop: {
          isObject: function() {
            return false;
          },
          implementation: 'implementation'
        }
      };
      assert.equal(builder.build(registration, null), 'implementation');
    });
  });

  describe('OutputBuilder', function() {
    var sandbox,
        childBuilder,
        mockChildBuilder,
        builder;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      childBuilder = barista.OutputBuilder();
      mockChildBuilder = sandbox.mock(childBuilder);
      builder = new barista.OutputBuilder(childBuilder);
    });

    afterEach(function() {
      mockChildBuilder.verify();
      sandbox.restore();
    });

    it('build() with no children returns empty object', function() {
      assert.deepEqual(builder.build({}), {});
    });

    it('build() with one child returns object with built child', function() {
      mockChildBuilder.expects('build').once().withExactArgs('child1', 'invokers1').returns('builtChild1');
      assert.deepEqual(builder.build({child1: 'child1'}, {child1: 'invokers1'}), {child1: 'builtChild1'});
    });

    it('build() with one child does nothing when not hasOwnProperty', function() {
      assert.deepEqual(builder.build({
        hasOwnProperty: function() {
          return false;
        }
      }, null), {});
    });

    it('build() with many children returns object with built children', function() {
      mockChildBuilder.expects('build').once().withExactArgs('child1', 'invokers1').returns('builtChild1');
      mockChildBuilder.expects('build').once().withExactArgs('child2', 'invokers2').returns('builtChild2');
      mockChildBuilder.expects('build').once().withExactArgs('child3', 'invokers3').returns('builtChild3');
      assert.deepEqual(builder.build({
            child1: 'child1',
            child2: 'child2',
            child3: 'child3'
          }, {
            child1: 'invokers1',
            child2: 'invokers2',
            child3: 'invokers3'
          }), {
            child1: 'builtChild1',
            child2: 'builtChild2',
            child3: 'builtChild3'
          });
    });

    it('build() with many children only processes when hasOwnProperty', function() {
      var stubHasOwnProperty = sinon.stub();
      stubHasOwnProperty.withArgs('child1').returns(false);
      stubHasOwnProperty.withArgs('child2').returns(true);
      stubHasOwnProperty.withArgs('child3').returns(false);
      stubHasOwnProperty.withArgs('hasOwnProperty').returns(false);
      mockChildBuilder.expects('build').once().withExactArgs('child2', 'invokers2').returns('builtChild2');
      assert.deepEqual(builder.build({
            child1: 'child1',
            child2: 'child2',
            child3: 'child3',
            hasOwnProperty: stubHasOwnProperty
          }, {
            child2: 'invokers2'
          }), {
            child2: 'builtChild2'
          });
    });
  });

  describe('barista', function() {
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
          servedNs = barista.serve(function(namespaces) {
            namespaces.include(new nsSimple('depends'));
          }, function(registrations) {
            registrations.Namespace1.ObjDef2.register(function(entries) {
              entries.withEntry().singleton();
            });
          }).namespaces.Namespace1,
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

    it('serve() with multiple namespaces, including various instancing types, and full dependency injection', function() {
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
          served = barista.serve(function(namespaces) {
            namespaces.include(new nsUtils(), 'Utils');
            namespaces.include(new nsResponsibilities(), 'Responsibilities');
            namespaces.include(new nsWidget(), 'Widget');
          }, function(registrations) {
            registrations.Utils.addAlternatingChar.register(function(entries) {
              entries.withEntry().withValueParam('default').withValueParam(' ');
            });
            registrations.Utils.Tester.register(function(entries) {
              entries.withEntry().named('notdefault').withValueParam('uses _default');
            });
            registrations.Utils.Prepender.register(function(entries) {
              entries.withEntry().withValueParam('-');
              entries.withEntry().named('special').withValueParam('special');
            });
            registrations.Utils.Capitalizer.register(function(entries) {
              entries.withEntry().singleton();
            });
            registrations.Responsibilities.PrependResponsibility.register(function(entries, registered) {
              entries.withEntry().withParam(registered.Utils.Prepender._default);
            });
            registrations.Responsibilities.PrependAndCapitalizeResponsibility.register(function(entries, registered) {
              entries.withEntry().withParam(registered.Utils.Prepender._default).withParam(registered.Utils.Capitalizer._default);
            });
            registrations.Responsibilities.AppendPlusesResponsibility.register(function(entries) {
              entries.withEntry().named('p3').withValueParam(3);
            });
            registrations.Responsibilities.AppendPlusesResponsibility.register(function(entries) {
              entries.withEntry().named('p1').withValueParam(1);
            });
            registrations.Utils.ChainOfResponsibilities.register(function(entries, registered) {
              entries
                .withEntry()
                .named('widget1Controller')
                .withArrayParam(function(params) {
                  params
                    .withParam(registered.Responsibilities.PrependResponsibility._default)
                    .withParam(registered.Responsibilities.AppendPlusesResponsibility.p3)
                    .withParam(registered.Responsibilities.WrapResponsibility._default);
                });
              entries
                .withEntry()
                .named('widget2Controller')
                .withArrayParam(function(params) {
                  params
                    .withParam(registered.Responsibilities.PrependAndCapitalizeResponsibility._default)
                    .withParam(registered.Responsibilities.AppendPlusesResponsibility.p1)
                    .withParam(registered.Responsibilities.WrapResponsibility._default);
                });
            });
            registrations.Widget.Widget1.register(function(entries, registered) {
              entries.withEntry().withParam(registered.Utils.ChainOfResponsibilities.widget1Controller);
            });
            registrations.Widget.Widget2.register(function(entries, registered) {
              entries.withEntry().withParam(registered.Utils.ChainOfResponsibilities.widget2Controller);
            });
          });

      assert.equal(served.namespaces.Utils.Prepender('overriden').prepend('value'), 'overridenvalue');
      assert.equal(served.namespaces.Widget.Widget1().run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(served.namespaces.Widget.Widget2().run('initial_value'), 'Widget2[-INITIAL_VALUE+]');
      assert.equal(served.namespaces.Utils.addAlternatingChar('value'), 'v a l u e ');
      assert.equal(served.namespaces.Utils.addAlternatingChar('value', '-'), 'v-a-l-u-e-');

      assert.equal(served.registered.Utils.Tester._default().test(), 'uses _default');
      assert.equal(served.registered.Utils.Tester.notdefault().test(), 'uses _default');
      assert.equal(served.registered.Widget.Widget1._default().run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(served.registered.Widget.Widget1._default().run('initial_value'), 'Widget1[-initial_value+++]');
      assert.equal(served.registered.Widget.Widget2._default().run('initial_value'), 'Widget2[-INITIAL_VALUE+]');
      assert.equal(served.registered.Widget.Widget2._default(served.registered.Utils.ChainOfResponsibilities.widget1Controller()).run('initial_value'), 'Widget2[-initial_value+++]');
      assert.equal(served.registered.Utils.Prepender.special().prepend('value'), 'specialvalue');
      assert.equal(served.registered.Utils.Prepender.special('overriden1').prepend('value'), 'overriden1value');
      assert.equal(served.registered.Utils.Prepender._default('overriden2').prepend('value'), 'overriden2value');
      assert.equal(served.registered.Utils.addAlternatingChar._default('value'), 'v a l u e ');
      assert.equal(served.registered.Utils.addAlternatingChar._default('value', '-'), 'v-a-l-u-e-');
    });

    it('serve() with standard namespace using this pointer', function() {
      var ns = function() {
        this.ObjDef = function(arg1) { this.x = arg1; };
      },
          served = barista.serve(function(namespaces) {
            namespaces.include(new ns(), 'Simple');
          }, function(registrations) {
            registrations.Simple.ObjDef.register(function(entries) {
              entries.withEntry().withValueParam('param1');
            });
          });
      assert.equal(served.namespaces.Simple.ObjDef().x, 'param1');
      assert.equal(served.registered.Simple.ObjDef._default().x, 'param1');
    });

    it('serve() with requireReg mode throws when using not fully registered object', function() {
      var nsSimple = function() {
        function ObjNoEntry() { return {}; }
        function ObjNoType() { return {}; }
        function ObjDependentUponObjNoEntry(obj) { return {obj: obj}; }

        return {
          ObjNoEntry: ObjNoEntry,
          ObjNoType: ObjNoType,
          ObjDependentUponObjNoEntry: ObjDependentUponObjNoEntry
        };
      },
          served = barista.serve(function(namespaces) {
            namespaces.include(new nsSimple(), 'Simple');
          }, function(registrations) {
            registrations.Simple.ObjNoType.register(function(entries) {
              entries.withEntry();
            });
            registrations.Simple.ObjDependentUponObjNoEntry.register(function(entries, registered) {
              entries.withEntry().perDependency().withParam(registered.Simple.ObjNoEntry._default);
            });
          }, {
            requireReg: true
          });

      assert.throw(function() { served.namespaces.Simple.ObjNoEntry(); }, 'using barista in requireReg mode requires that you register "function ObjNoEntry() { return {}; }" and specify singleton or perDependency');
      assert.throw(function() { served.namespaces.Simple.ObjNoType(); }, 'using barista in requireReg mode requires that you register "function ObjNoType() { return {}; }" and specify singleton or perDependency');
      assert.throw(function() { served.namespaces.Simple.ObjDependentUponObjNoEntry(); }, 'using barista in requireReg mode requires that you register "function ObjNoEntry() { return {}; }" and specify singleton or perDependency');
      assert.throw(function() { served.registered.Simple.ObjNoEntry._default(); }, 'using barista in requireReg mode requires that you register "function ObjNoEntry() { return {}; }" and specify singleton or perDependency');
      assert.throw(function() { served.registered.Simple.ObjNoType._default(); }, 'using barista in requireReg mode requires that you register "function ObjNoType() { return {}; }" and specify singleton or perDependency');
      assert.throw(function() { served.registered.Simple.ObjDependentUponObjNoEntry._default(); }, 'using barista in requireReg mode requires that you register "function ObjNoEntry() { return {}; }" and specify singleton or perDependency');
    });

    it('serve() example using runtime param to index', function() {
      var nsWorkers = function() {
        function Worker1() {
          return {id: 1};
        }

        function Worker2() {
          return {id: 2};
        }

        function Worker3() {
          return {id: 3};
        }

        return {
          Worker1: Worker1,
          Worker2: Worker2,
          Worker3: Worker3
        };
      },
          nsBoss = function() {
            function Assistant1(workers) {
              function getWorkerId(arg) {
                return workers[arg].id;
              }
              return {getWorkerId: getWorkerId};
            }

            function Assistant2(workers) {
              function getWorkerId(arg) {
                return workers(arg).id;
              }
              return {getWorkerId: getWorkerId};
            }

            return {
              Assistant1: Assistant1,
              Assistant2: Assistant2
            };
          },
          served = barista.serve(function(namespaces) {
            namespaces.include(new nsWorkers(), 'Workers');
            namespaces.include(new nsBoss(), 'Boss');
          }, function(registrations) {
            registrations.Boss.Assistant1.register(function(entries, registered) {
              entries.withEntry().withParam(function() {
                return {
                  key1: registered.Workers.Worker1._default(),
                  key2: registered.Workers.Worker2._default(),
                  key3: registered.Workers.Worker3._default()
                };
              });
            });
            registrations.Boss.Assistant2.register(function(entries, registered, resolver) {
              entries.withEntry().named('resolve').withValueParam(function(arg) {
                return resolver.resolve('Workers.Worker' + arg);
              });
            });
          });

      var assistant = served.registered.Boss.Assistant1._default();
      assert.equal(assistant.getWorkerId('key1'), 1);
      assert.equal(assistant.getWorkerId('key2'), 2);
      assert.equal(assistant.getWorkerId('key3'), 3);
      assistant = served.registered.Boss.Assistant2.resolve();
      assert.equal(assistant.getWorkerId('1'), 1);
      assert.equal(assistant.getWorkerId('2'), 2);
      assert.equal(assistant.getWorkerId('3'), 3);
    });
    
    it('serve() with injected property that is object and function', function() {
      var nsTest = function() {
        function someFunc(value) {
          return value;
        }
        
        var someObject = {
          test : function() {
            return 'test';
          }
        };

        function InjectionReceiver(f, o) {
          function test(value) {
            console.log('InjectionReceiver::test');
            console.log(f);
            console.log(o);
            return f(value) + o.test();
          }
          return {
            test: test
          };
        }
        return {
          someFunc: someFunc,
          someObject: someObject,
          InjectionReceiver: InjectionReceiver
        };
      },
        ns = barista.serve(function(namespaces) {
            namespaces.include(new nsTest(), 'ns');
          }, function(registrations) {
            registrations.ns.InjectionReceiver.register(function(entries, registered) {
              entries
                .withEntry()
                .withValueParam(registered.ns.someFunc._default)
                .withValueParam(registered.ns.someObject._definition);
            });
          }).namespaces.ns;
      
      assert.equal(ns.InjectionReceiver().test("123"), "123test");
    });
  });
});