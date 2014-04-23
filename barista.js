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

  function EntryDefaulter() {
    function getDefaultEntry() {
      return {name: _default, params: [], type: useStrict ? _not_set : _perdependency};
    }

    function setEntryDefaults(entries) {
      entries = entries && entries.length > 0 ? entries : [{}];
      entries.forEach(function(entry) {
        entry.type = entry.type || getDefaultEntry().type;
        entry.name = entry.name || getDefaultEntry().name;
        entry.params = entry.params
          ? entry.params
          : getDefaultEntry().params;
      });
      return entries;
    }

    return {
      getDefaultEntry: getDefaultEntry,
      setEntryDefaults: setEntryDefaults
    };
  }

  function Menu(nameGenerator, entryDefaulter, menu) {
    menu = menu || {details: {}};

    var currentEntryArray,
        currentEntry,
        currentParamArray,
        verifyEntry = function(throwMessage) {
          if (!currentEntry) {
            throw throwMessage;
          }
        },
        verifyParamArray = function(throwMessage) {
          if (!currentParamArray) {
            throw throwMessage;
          }
        };

    this.forNamespace = function(name) {
      menu.name = name;
      return this;
    };

    this.getNamespace = function() {
      if (!menu.name) {
        menu.name = nameGenerator.generate();
      }
      return menu.name;
    };

    this.getEntries = function(name) {
      return menu.details[name] || [{}];
    };

    this.getDefaultedEntries = function(name) {
      return entryDefaulter.setEntryDefaults(this.getEntries(name));
    };

    this.withItem = function(itemName) {
      if (!menu.details[itemName]) {
        currentEntryArray = [];
        menu.details[itemName] = currentEntryArray;
      }
      currentEntry = entryDefaulter.getDefaultEntry();
      currentEntryArray.push(currentEntry);
      currentParamArray = null;
      return this;
    };

    this.named = function(name) {
      verifyEntry('call to named() without call to withItem() is invalid');
      currentEntry.name = name;
      return this;
    };

    this.singleton = function() {
      verifyEntry('call to singleton() without call to withItem() is invalid');
      currentEntry.type = _singleton;
      return this;
    };

    this.perDependency = function() {
      verifyEntry('call to perDependency() without call to withItem() is invalid');
      currentEntry.type = _perdependency;
      return this;
    };

    this.withResolveParam = function(resolve) {
      verifyEntry('call to withResolveParam() without call to withItem() is invalid');
      currentEntry.params.push({resolve: resolve});
      return this;
    };

    this.withValueParam = function(value) {
      verifyEntry('call to withValueParam() without call to withItem() is invalid');
      currentEntry.params.push({value: value});
      return this;
    };

    this.withFuncParam = function(func) {
      verifyEntry('call to withFuncParam() without call to withItem() is invalid');
      currentEntry.params.push({func: func});
      return this;
    };

    this.withArrayParam = function() {
      verifyEntry('call to withArrayParam() without call to withItem() is invalid');
      currentParamArray = [];
      currentEntry.params.push({array: currentParamArray});
      return this;
    };

    this.pushResolveParam = function(resolveString) {
      verifyParamArray('call to pushResolveParam() without call to withArrayParam() is invalid');
      currentParamArray.push({resolve: resolveString});
      return this;
    };

    this.pushValueParam = function(value) {
      verifyParamArray('call to pushValueParam() without call to withArrayParam() is invalid');
      currentParamArray.push({value: value});
      return this;
    };

    this.pushFuncParam = function(func) {
      verifyParamArray('call to pushFuncParam() without call to withArrayParam() is invalid');
      currentParamArray.push({func: func});
      return this;
    };
  }

  function newMenu() {
    return new Menu(new NamespaceNameGenerator(), new EntryDefaulter());
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
      return {value: arg};
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
            return param.func();
          },
          resolve: function(param) {
            var resolveParam = new ResolvedParam(param.resolve),
                invoker = injectionMapper.find(resolveParam.namespace, resolveParam.item, resolveParam.entry);
            return invoker ? invoker() : null;
          },
          array: function(param) {
            return newInjectionResolverFunc(me).resolve(param.array);
          }
        };

    function resolve(param) {
      return resolverMap[Object.keys(param)[0]](param);
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

  function serve(ns, menu) {
    var injectionMapper = new InjectionMapper();
    return new Processor(
      new PropertyExtractor(ns, newProperty),
      new NamespaceBuilder(
        new ItemInvokerBuilder(
          menu || newMenu(),
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

  function serveObject(implementation, name, menu) {
    var injectionMapper = new InjectionMapper();
    return new ItemInvokerBuilder(
      menu || newMenu(),
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
    menu: newMenu,
    serve: serve,
    serveObject: serveObject,
    make: make,
    Menu: Menu,
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