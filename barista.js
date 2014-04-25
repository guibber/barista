var Barista = function(config) {
  'use strict';
  config = config || {};
  var injectionMap = config.injectionMap || {},
      useStrict = config.useStrict || false,
      _singleton = 'singleton',
      _perdependency = 'perdependency',
      _not_set = 'not_set',
      _default = '_default',
      namespaceIndex = 0;

  function NamespaceNameGenerator() {
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

    this.withFuncParam = function(func) {
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

    this.withFuncParam = function(func) {
      paramsObj.withFuncParam(func);
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

  function EntryDefaulter(newEntryFunc) {
    function getDefaultedEntry(entry) {
      entry.name = entry.name || _default;
      entry.params = entry.params || [];
      entry.type = entry.type || (useStrict ? _not_set : _perdependency);
      return entry;
    }

    function getDefaultedEntries(entries) {
      entries = entries && entries.length > 0 ? entries : [newEntryFunc()];
      entries.forEach(function(entry) {
        getDefaultedEntry(entry);
      });
      return entries;
    }

    return {
      getDefaultedEntry: getDefaultedEntry,
      getDefaultedEntries: getDefaultedEntries
    };
  }

  function MenuItem(name, newEntryFunc) {
    this.entries = [];
    this.name = name;
    this.withEntry = function() {
      var entry = newEntryFunc();
      this.entries.push(entry);
      return entry;
    };
  }

  function newMenuItem(name) {
    return new MenuItem(name, newEntry);
  }

  function Menu(nameGenerator, entryDefaulter, newMenuItemFunc) {
    this.items = {};

    this.forNamespace = function(name) {
      this.name = name;
      return this;
    };

    this.getNamespace = function() {
      if (!this.name) {
        this.name = nameGenerator.generate();
      }
      return this.name;
    };

    this.getEntries = function(name) {
      return this.items[name] ? this.items[name].entries : newMenuItemFunc(name).entries;
    };

    this.getDefaultedEntries = function(name) {
      return entryDefaulter.getDefaultedEntries(this.getEntries(name));
    };

    this.withItem = function(name) {
      if (!this.items[name]) {
        this.items[name] = newMenuItemFunc(name);
      }
      return entryDefaulter.getDefaultedEntry(this.items[name].withEntry());
    };
  }

  function newMenu() {
    return new Menu(new NamespaceNameGenerator(), new EntryDefaulter(newEntry), newMenuItem);
  }

  function Property(name, implementation) {
    function isFunction() {
      return typeof(implementation) === 'function';
    }

    function isObject() {
      return isFunction();
    }

    return {
      name: name,
      implementation: implementation,
      isObject: isObject
    };
  }

  function newProperty(name, implementation) {
    return new Property(name, implementation);
  }

  function PropertyExtractor(ns, newPropFunc) {
    function extract(name) {
      return newPropFunc(name, ns[name]);
    }

    return {
      extract: extract
    };
  }

  function InjectionMapper() {
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

    function defaultExists(nsName, itemName) {
      return find(nsName, itemName, _default) ? true : false;
    }

    function find(nsName, itemName, entryName) {
      var sourceNs = getChild(injectionMap, nsName),
          obj = getChild(sourceNs, itemName);

      return getChild(obj, getEntryName(entryName));
    }

    function map(nsName, itemName, entryName, invoker) {
      var sourceNs = getChild(injectionMap, nsName, {}),
          obj = getChild(sourceNs, itemName, {}),
          name = getEntryName(entryName);

      injectionMap[nsName] = sourceNs;
      sourceNs[itemName] = obj;
      obj[name] = invoker;

      if (!isDefaultName(name) && !defaultExists(nsName, itemName)) {
        obj[_default] = invoker;
      }
    }

    return {
      find: find,
      map: map
    };
  }

  function ArgsWrapper() {
    function buildParam(arg) {
      return newParam('value', arg);
    }

    function wrap(args) {
      args = args || [];
      return args.map(buildParam);
    }

    return {
      wrap: wrap
    };
  }

  function ArgsOverrider(argsWrapper) {
    function override(params, args) {
      params = params || [];
      args = argsWrapper.wrap(Array.prototype.slice.call(args || []));
      var i,
          merged = new Array(params.length > args.length ? params.length : args.length);
      for (i = 0; i < merged.length; ++i) {
        merged[i] = args[i] || params[i];
      }
      return merged;
    }

    return {
      override: override
    };
  }

  function ResolvedParam(key) {
    var values = key.split('.');
    return {
      namespace: values[0],
      item: values[1],
      entry: values.length > 2 ? values[2] : _default
    };
  }

  function ParamResolver(injectionMapper, newInjectionResolverFunc) {
    var me,
        resolverMap = {
          value: function(param) {
            return param.value;
          },
          func: function(param) {
            return param.value();
          },
          resolve: function(param) {
            var resolveParam = new ResolvedParam(param.value),
                invoker = injectionMapper.find(resolveParam.namespace, resolveParam.item, resolveParam.entry);
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

  function Maker(argsOverrider, injectionResolver) {
    function make(implementation, params, args) {
      var obj = Object.create(implementation.prototype),
          ret = implementation.apply(obj, injectionResolver.resolve(argsOverrider.override(params, args)));
      return ret && (Object(ret) === ret || typeof(ret) !== 'object') ? ret : obj;
    }

    return {
      make: make
    };
  }

  function OrderTaker(maker) {
    function orderPerDependency(implementation, params) {
      return function() {
        return maker.make(implementation, params, arguments);
      };
    }

    function orderSingleton(implementation, params) {
      var instance;
      return function() {
        if (instance) {
          return instance;
        }
        instance = maker.make(implementation, params, arguments);
        return instance;
      };
    }

    function orderNotSet(implementation) {
      return function() {
        throw ('using barista in strict mode requires that you register "' + implementation + '" using menu.withItem and specifying singleton or perDependency');
      };
    }

    return {
      orderPerDependency: orderPerDependency,
      orderSingleton: orderSingleton,
      orderNotSet: orderNotSet
    };
  }

  function InvokerBuilder(orderTaker, injectionMapper) {
    var typeMap = {
      'perdependency': function(i, p) { return orderTaker.orderPerDependency(i, p); },
      'singleton': function(i, p) { return orderTaker.orderSingleton(i, p); },
      'not_set': function(i, p) { return orderTaker.orderNotSet(i, p); }
    };

    function build(nsName, prop, item) {
      var invoker = injectionMapper.find(nsName, prop.name, item.name);
      if (!invoker) {
        invoker = typeMap[item.type](prop.implementation, item.params);
        injectionMapper.map(nsName, prop.name, item.name, invoker);
      }
      return invoker;
    }

    return {
      build: build
    };
  }

  function ItemInvokerBuilder(menu, invokerBuilder) {
    function build(prop) {
      var invokers = {},
          defaultInvoker,
          nsName = menu.getNamespace();
      menu.getDefaultedEntries(prop.name).forEach(function(entry) {
        var invoker = invokerBuilder.build(nsName, prop, entry);
        invokers[entry.name] = invoker;
        if (!defaultInvoker || entry.name === _default) {
          defaultInvoker = invoker;
        }
      });
      invokers._default = (invokers._default || defaultInvoker) ? (invokers._default || defaultInvoker) : null;
      return invokers;
    }

    return {
      build: build
    };
  }

  function NamespaceBuilder(itemInvokerBuilder) {
    var retNs = {};

    function addObject(prop) {
      retNs[prop.name] = itemInvokerBuilder.build(prop)._default;
    }

    function addNonObject(prop) {
      retNs[prop.name] = prop.implementation;
    }

    function add(prop) {
      if (prop.isObject()) {
        addObject(prop);
      } else {
        addNonObject(prop);
      }
    }

    function build() {
      return retNs;
    }

    return {
      add: add,
      build: build
    };
  }

  function Processor(extractor, namespaceBuilder) {
    function process(ns) {
      var name;
      for (name in ns) {
        if (ns.hasOwnProperty(name)) {
          namespaceBuilder.add(extractor.extract(name));
        }
      }
      return namespaceBuilder.build();
    }

    return {
      process: process
    };
  }

  function serve(ns, menuFunc) {
    var injectionMapper = new InjectionMapper(),
        menu = newMenu();
    if (menuFunc) {
      menuFunc(menu);
    }
    return new Processor(
      new PropertyExtractor(ns, newProperty),
      new NamespaceBuilder(
        new ItemInvokerBuilder(
          menu,
          new InvokerBuilder(
            new OrderTaker(new Maker(
              new ArgsOverrider(new ArgsWrapper()),
              new InjectionResolver(new ParamResolver(injectionMapper, newInjectionResolver))
            )),
            injectionMapper
          )
        )
      )
    ).process(ns);
  }

  function serveObject(implementation, name, menuFunc) {
    var injectionMapper = new InjectionMapper(),
        menu = newMenu();
    if (menuFunc) {
      menuFunc(menu);
    }
    return new ItemInvokerBuilder(
      menu,
      new InvokerBuilder(
        new OrderTaker(new Maker(
          new ArgsOverrider(new ArgsWrapper()),
          new InjectionResolver(new ParamResolver(injectionMapper, newInjectionResolver))
        )),
        injectionMapper
      )
    ).build(newProperty(name, implementation));
  }

  function make(item) {
    var resolveParam = new ResolvedParam(item),
        invoker = new InjectionMapper().find(resolveParam.namespace, resolveParam.item, resolveParam.entry);
    return invoker ? invoker.apply(null, Array.prototype.slice.call(arguments || []).splice(1)) : null;
  }

  return {
    serve: serve,
    serveObject: serveObject,
    make: make,
    Menu: Menu,
    MenuItem: MenuItem,
    Param: Param,
    Params: Params,
    newParams: newParams,
    Entry: Entry,
    Processor: Processor,
    ArgsOverrider: ArgsOverrider,
    ArgsWrapper: ArgsWrapper,
    InjectionResolver: InjectionResolver,
    Maker: Maker,
    OrderTaker: OrderTaker,
    Property: Property,
    newProperty: newProperty,
    PropertyExtractor: PropertyExtractor,
    EntryDefaulter: EntryDefaulter,
    InjectionMapper: InjectionMapper,
    ResolvedParam: ResolvedParam,
    ParamResolver: ParamResolver,
    InvokerBuilder: InvokerBuilder,
    ItemInvokerBuilder: ItemInvokerBuilder,
    NamespaceBuilder: NamespaceBuilder,
    NamespaceNameGenerator: NamespaceNameGenerator
  };
};