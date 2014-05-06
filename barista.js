var barista = function() {
  'use strict';
  var _singleton = 'singleton',
      _perdependency = 'perdependency',
      _not_set = 'not_set',
      _default = '_default';

  function IncludedNamespace(name, instance) {
    this.name = name;
    this.instance = instance;
  }

  function NamespaceNameGenerator() {
    var namespaceIndex = 0;
    function generate() {
      return 'Namespace' + ++namespaceIndex;
    }
    return {
      generate: generate
    };
  }

  function Param(type, value) {
    this.type = type;
    this.value = value;
  }

  function newParam(type, value) {
    return new Param(type, value);
  }

  function Params(newParamFunc, newParamsFunc) {
    this.value = [];
    this.type = 'array';

    this.withResolveParam = function(resolve) {
      this.value.push(newParamFunc('resolve', resolve));
      return this;
    };

    this.withValueParam = function(value) {
      this.value.push(newParamFunc('value', value));
      return this;
    };

    this.withParam = function(func) {
      this.value.push(newParamFunc('func', func));
      return this;
    };

    this.withArrayParam = function(addArrayParamsFunc) {
      var param = newParamsFunc();
      this.value.push(param);
      addArrayParamsFunc(param);
      return this;
    };
  }

  function newParams() {
    return new Params(newParam, newParams);
  }

  function Entry(paramsObj) {
    this.params = paramsObj.value;

    this.named = function(name) {
      this.name = name;
      return this;
    };

    this.singleton = function() {
      this.type = _singleton;
      return this;
    };

    this.perDependency = function() {
      this.type = _perdependency;
      return this;
    };

    this.withResolveParam = function(resolve) {
      paramsObj.withResolveParam(resolve);
      return this;
    };

    this.withValueParam = function(value) {
      paramsObj.withValueParam(value);
      return this;
    };

    this.withParam = function(func) {
      paramsObj.withParam(func);
      return this;
    };

    this.withArrayParam = function(addArrayParamsFunc) {
      paramsObj.withArrayParam(addArrayParamsFunc);
      return this;
    };
  }

  function newEntry() {
    return new Entry(newParams());
  }

  function EntryDefaulter(newEntryFunc, requireReg) {
    function getDefaultedEntry() {
      var entry = newEntryFunc();
      entry.type = entry.type || (requireReg ? _not_set : _perdependency);
      entry.name = entry.name || _default;
      entry.params = entry.params || [];
      return entry;
    }
    return {
      getDefaultedEntry: getDefaultedEntry
    };
  }

  function Entries(entryDefaulter) {
    var entries = [];

    function reset() {
      entries.length = 0;
    }

    function getEntries() {
      return entries;
    }

    function withEntry() {
      var entry = entryDefaulter.getDefaultedEntry();
      entries.push(entry);
      return entry;
    }

    return {
      reset: reset,
      getEntries: getEntries,
      withEntry: withEntry
    };
  }

  function newEntries(requireReg) {
    return new Entries(new EntryDefaulter(newEntry, requireReg));
  }

  function Property(namespace, name, implementation) {
    function isFunction() {
      return typeof(implementation) === 'function';
    }

    function isObject() {
      return isFunction();
    }

    return {
      namespace: namespace,
      name: name,
      implementation: implementation,
      isObject: isObject
    };
  }

  function newProperty(namespace, name, implementation) {
    return new Property(namespace, name, implementation);
  }

  function PropertyExtractor(newPropFunc) {
    function extract(ns, name) {
      return newPropFunc(ns, name, ns.instance[name]);
    }

    return {
      extract: extract
    };
  }

  function InvokersMapper(invokers) {
    function getEntryName(entryName) {
      return entryName || _default;
    }

    function getChild(parent, childName, empty) {
      return parent
        ? parent[childName] || empty
        : empty;
    }

    function isDefaultName(name) {
      return name === _default;
    }

    function find(nsName, itemName, entryName) {
      var sourceNs = getChild(invokers, nsName),
          obj = getChild(sourceNs, itemName);

      return getChild(obj, getEntryName(entryName));
    };

    function defaultExists(nsName, itemName) {
      return find(nsName, itemName, _default) ? true : false;
    }

    function map(nsName, itemName, entryName, invoker) {
      var sourceNs = getChild(invokers, nsName, {}),
          obj = getChild(sourceNs, itemName, {}),
          name = getEntryName(entryName);

      invokers[nsName] = sourceNs;
      sourceNs[itemName] = obj;
      obj[name] = invoker;

      if (!isDefaultName(name) && !defaultExists(nsName, itemName)) {
        obj[_default] = invoker;
      }
    };

    return {
      invokers: invokers,
      find: find,
      map: map
    };
  }

  function ArgsOverrider(injectionResolver, paramResolver) {
    function override(params, args) {
      params = params || [];
      var i;
      if (!args || args.length === 0) {
        return params.length > 0 ? injectionResolver.resolve(params) : [];
      }
      if (params.length <= args.length) {
        return args;
      }
      args = Array.prototype.slice.call(args);
      for (i = args.length; i < params.length; ++i) {
        args.push(paramResolver.resolve(params[i]));
      }
      return args;
    }

    return {
      override: override
    };
  }

  function ResolveKey(id) {
    var values = id.split('.');
    return {
      namespace: values[0],
      item: values[1],
      entry: values.length > 2 ? values[2] : _default
    };
  }

  function InjectionResolver(paramResolver) {
    function resolve(params) {
      return params.map(paramResolver.resolve);
    }

    return {
      resolve: resolve
    };
  }

  function newInjectionResolver(paramResolver) {
    return new InjectionResolver(paramResolver);
  }

  function ParamResolver(invokersMapper, newInjectionResolverFunc) {
    var me,
        resolverMap = {
          value: function(param) {
            return param.value;
          },
          func: function(param) {
            return param.value();
          },
          resolve: function(param) {
            var key = new ResolveKey(param.value),
                invoker = invokersMapper.find(key.namespace, key.item, key.entry);
            return invoker ? invoker() : null;
          },
          array: function(param) {
            return newInjectionResolverFunc(me).resolve(param.value);
          }
        };

    function resolve(param) {
      return resolverMap[param.type](param);
    }

    me = {
      resolve: resolve
    };
    return me;
  }

  function Factory(argsOverrider) {
    function make(implementation, params, args) {
      var obj = Object.create(implementation.prototype),
          applyArgs = argsOverrider.override(params, args),
          ret = implementation.apply(obj, applyArgs);
      return ret && (Object(ret) === ret || typeof(ret) !== 'object') ? ret : obj;
    }

    return {
      make: make
    };
  }

  function InvokerTypeBuilder(factory) {
    function buildPerDependency(implementation, params) {
      return function() {
        return factory.make(implementation, params, arguments);
      };
    }

    function buildSingleton(implementation, params) {
      var instance;
      return function() {
        if (instance) {
          return instance;
        }
        instance = factory.make(implementation, params, arguments);
        return instance;
      };
    }

    function buildNotSet(implementation) {
      return function() {
        throw ('using barista in requireReg mode requires that you register "' + implementation + '" and specify singleton or perDependency');
      };
    }

    return {
      buildPerDependency: buildPerDependency,
      buildSingleton: buildSingleton,
      buildNotSet: buildNotSet
    };
  }

  function InvokerBuilder(typeBuilder) {
    var typeMap = {
      'perdependency': function(i, p) { return typeBuilder.buildPerDependency(i, p); },
      'singleton': function(i, p) { return typeBuilder.buildSingleton(i, p); },
      'not_set': function(i, p) { return typeBuilder.buildNotSet(i, p); }
    };

    function build(prop, entry) {
      return typeMap[entry.type](prop.implementation, entry.params);
    }

    return {
      build: build
    };
  }

  function InvokerMapBuilder(invokerBuilder, invokersMapper) {
    function build(prop, entries) {
      var defaultInvoker,
          defaultExplicitlyDefined = false;
      entries.forEach(function(entry) {
        var invoker = invokerBuilder.build(prop, entry);
        invokersMapper.map(prop.namespace.name, prop.name, entry.name, invoker);
        defaultExplicitlyDefined = defaultExplicitlyDefined || entry.name === _default;
        if (!defaultInvoker || entry.name === _default) {
          defaultInvoker = invoker;
        }
      });
      if (!defaultExplicitlyDefined && defaultInvoker) {
        invokersMapper.map(prop.namespace.name, prop.name, _default, defaultInvoker);
      }
    }

    return {
      build: build
    };
  }

  function Resolver(invokersMapper) {
    this.resolve = function(id) {
      var key = new ResolveKey(id),
          invoker = invokersMapper.find(key.namespace, key.item, key.entry);
      return invoker ? invoker.apply(null, Array.prototype.slice.call(arguments || []).splice(1)) : null;
    };
  }

  function PropEntriesRegistrar(invokerMapBuilder, invokersMapper, resolver, prop, entries) {
    function register(entriesFunc) {
      entries.reset();
      entriesFunc(entries, invokersMapper.invokers, resolver);
      invokerMapBuilder.build(prop, entries.getEntries());
    }

    return {
      prop: prop,
      register: register
    };
  }

  function newPropEntriesRegistrar(invokerMapBuilder, invokersMapper, resolver, prop, entries) {
    return new PropEntriesRegistrar(invokerMapBuilder, invokersMapper, resolver, prop, entries);
  }

  function PropEntriesRegistrarBuilder(invokerMapBuilder, invokersMapper, resolver, newEntriesFunc, newPropEntriesRegistrarFunc) {
    this.build = function(prop) {
      return newPropEntriesRegistrarFunc(invokerMapBuilder, invokersMapper, resolver, prop, newEntriesFunc());
    };
  }

  function NamespaceRegistrarBuilder(extractor, nsPropRegistrarBuilder) {
    function addDefaultEntry(entries) {
      entries.withEntry();
    }

    function build(ns) {
      var def = {};
      var name;
      for (name in ns.instance) {
        if (ns.instance.hasOwnProperty(name)) {
          var prop = extractor.extract(ns, name);
          def[prop.name] = nsPropRegistrarBuilder.build(prop);
          def[prop.name].register(addDefaultEntry);
        }
      }
      return def;
    }

    return {
      addDefaultEntry: addDefaultEntry,
      build: build
    };
  }

  function newNamespaceRegistrarBuilder(invokersMapper, config) {
    var paramResolver = new ParamResolver(invokersMapper, newInjectionResolver);
    return new NamespaceRegistrarBuilder(new PropertyExtractor(newProperty),
      new PropEntriesRegistrarBuilder(
        new InvokerMapBuilder(
          new InvokerBuilder(
            new InvokerTypeBuilder(new Factory(
              new ArgsOverrider(new InjectionResolver(paramResolver), paramResolver)
            )),
            invokersMapper
          ),
          invokersMapper
        ),
        invokersMapper,
        new Resolver(invokersMapper),
        function() { return newEntries(config.requireReg); },
        newPropEntriesRegistrar
      )
    );
  }

  function NamespaceIncluder(nameGenerator, registrarBuilder) {
    this.registrations = {};
    this.include = function(namespace, name) {
      name = name || nameGenerator.generate();
      this.registrations[name] = registrarBuilder.build(new IncludedNamespace(name, namespace));
      return this;
    };
  }

  function newNamespaceIncluder(invokers, config) {
    return new NamespaceIncluder(new NamespaceNameGenerator(), newNamespaceRegistrarBuilder(new InvokersMapper(invokers), config));
  }

  function OutputPropBuilder() {
    function build(registration, invokers) {
      return registration.prop.isObject() ? invokers._default : registration.prop.implementation;
    }
    return {
      build: build
    };
  }

  function OutputBuilder(childBuilder) {
    function build(registrations, invokers) {
      var namespace = {};
      var name;
      for (name in registrations) {
        if (registrations.hasOwnProperty(name)) {
          namespace[name] = childBuilder.build(registrations[name], invokers[name]);
        }
      }
      return namespace;
    }

    return {
      build: build
    };
  }

  function serve(includeFunc, registerFunc, config) {
    config = config || {};
    var invokers = config.invokers || {},
        included = newNamespaceIncluder(invokers, config);

    includeFunc(included);
    registerFunc(included.registrations);

    return {
      namespaces: new OutputBuilder(new OutputBuilder(new OutputPropBuilder())).build(included.registrations, invokers),
      registered: invokers
    };
  }

  return {
    serve: serve,
    NamespaceNameGenerator: NamespaceNameGenerator,
    Param: Param,
    Params: Params,
    Entry: Entry,
    EntryDefaulter: EntryDefaulter,
    Entries: Entries,
    Property: Property,
    PropertyExtractor: PropertyExtractor,
    InvokersMapper: InvokersMapper,
    ArgsOverrider: ArgsOverrider,
    ResolveKey: ResolveKey,
    InjectionResolver: InjectionResolver,
    ParamResolver: ParamResolver,
    Factory: Factory,
    InvokerTypeBuilder: InvokerTypeBuilder,
    InvokerBuilder: InvokerBuilder,
    IncludedNamespace: IncludedNamespace,
    InvokerMapBuilder: InvokerMapBuilder,
    Resolver: Resolver,
    PropEntriesRegistrar: PropEntriesRegistrar,
    PropEntriesRegistrarBuilder: PropEntriesRegistrarBuilder,
    NamespaceRegistrarBuilder: NamespaceRegistrarBuilder,
    NamespaceIncluder: NamespaceIncluder,
    OutputPropBuilder: OutputPropBuilder,
    OutputBuilder: OutputBuilder
  };
}();