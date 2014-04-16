var Barista = function(injectionMap) {
  'use strict';
  injectionMap = injectionMap || {};
  var _singleton = 'singleton',
      _perdependency = 'perdependency',
      _default = '_default';

  function Config() {
    var config = {},
        currentObjArray,
        currentObjConfig,
        currentParamArray,
        getDefaultObjConfig = function() {
          return {name: _default, params: [], type: _perdependency};
        },
        verifyObjConfig = function(throwMessage) {
          if (!currentObjConfig)
            throw throwMessage;
        },
        verifyParamArray = function(throwMessage) {
          if (!currentParamArray)
            throw throwMessage;
        };

    this.get = function() {
      return config;
    };

    this.configure = function(objectName) {
      if (!config[objectName]) {
        currentObjArray = [];
        config[objectName] = currentObjArray;
      }
      currentObjConfig = getDefaultObjConfig();
      currentObjArray.push(currentObjConfig);
      currentParamArray = null;
      return this;
    };

    this.asName = function(name) {
      verifyObjConfig('call to asName() without call to configure() is invalid');
      currentObjConfig.name = name;
      return this;
    };

    this.asSingleton = function() {
      verifyObjConfig('call to asSingleton() without call to configure() is invalid');
      currentObjConfig.type = _singleton;
      return this;
    };

    this.asPerDependency = function() {
      verifyObjConfig('call to asPerDependency() without call to configure() is invalid');
      currentObjConfig.type = _perdependency;
      return this;
    };

    this.withResolveParam = function(resolve) {
      verifyObjConfig('call to withResolveParam() without call to configure() is invalid');
      currentObjConfig.params.push({resolve: resolve});
      return this;
    };

    this.withValueParam = function(value) {
      verifyObjConfig('call to withValueParam() without call to configure() is invalid');
      currentObjConfig.params.push({value: value});
      return this;
    };

    this.withFuncParam = function(func) {
      verifyObjConfig('call to withFuncParam() without call to configure() is invalid');
      currentObjConfig.params.push({func: func});
      return this;
    };

    this.withArrayParam = function() {
      verifyObjConfig('call to withArrayParam() without call to configure() is invalid');
      currentParamArray = [];
      currentObjConfig.params.push({array: currentParamArray});
      return this;
    };

    this.includingResolveParam = function(resolveString) {
      verifyParamArray('call to includingResolveParam() without call to withArrayParam() is invalid');
      currentParamArray.push({resolve: resolveString});
      return this;
    };

    this.includingValueParam = function(value) {
      verifyParamArray('call to includingValueParam() without call to withArrayParam() is invalid');
      currentParamArray.push({value: value});
      return this;
    };

    this.includingFuncParam = function(func) {
      verifyParamArray('call to includingFuncParam() without call to withArrayParam() is invalid');
      currentParamArray.push({func: func});
      return this;
    };
  }

  function ConfigDefaulter() {
    function setRegistrationDefaults(registrations) {
      registrations.forEach(function(registration) {
        registration.type = registration.type || _perdependency;
        registration.name = registration.name || _default;
        registration.params = registration.params
          ? Array.isArray(registration.params)
            ? registration.params
            : [registration.params]
          : [];
      });
      return registrations;
    }

    return {
      setRegistrationDefaults: setRegistrationDefaults
    };
  }

  function ConfigManager(nsName, config, configDefaulter) {
    config = config || {};
    function getNsName() {
      return nsName;
    }

    function getRegistrations(name) {
      var registrations = config[name] || [{}];
      return Array.isArray(registrations)
        ? configDefaulter.setRegistrationDefaults(registrations)
        : configDefaulter.setRegistrationDefaults([registrations]);
    }

    return {
      getRegistrations: getRegistrations,
      getNsName: getNsName
    };
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

  function InjectionMapper(overrideMap) {
    injectionMap = overrideMap || injectionMap;

    function getRegName(regName) {
      return regName || _default;
    }

    function getChild(parent, childName, empty) {
      return parent
        ? parent[childName] || empty
        : empty;
    }

    function isDefaultName(name) {
      return name === _default;
    }

    function defaultExists(sourceNsName, objName) {
      return find(sourceNsName, objName, _default) ? true : false;
    }

    function find(sourceNsName, objName, regName) {
      var sourceNs = getChild(injectionMap, sourceNsName),
          obj = getChild(sourceNs, objName);

      return getChild(obj, getRegName(regName));
    }

    function map(sourceNsName, objName, regName, invoker) {
      var sourceNs = getChild(injectionMap, sourceNsName, {}),
          obj = getChild(sourceNs, objName, {}),
          name = getRegName(regName);

      injectionMap[sourceNsName] = sourceNs;
      sourceNs[objName] = obj;
      obj[name] = invoker;

      if (!isDefaultName(name) && !defaultExists(sourceNsName, objName)) {
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
      object: values[1],
      name: values.length > 2 ? values[2] : _default
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
                invoker = injectionMapper.find(resolveParam.namespace, resolveParam.object, resolveParam.name);
            if (invoker) {
              return invoker();
            }
            return null;
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

    return {
      orderPerDependency: orderPerDependency,
      orderSingleton: orderSingleton
    };
  }

  function InvokerBuilder(orderTaker, injectionMapper) {
    var typeMap = {
      'perdependency': function(i, p) { return orderTaker.orderPerDependency(i, p); },
      'singleton': function(i, p) { return orderTaker.orderSingleton(i, p); }
    };

    function build(nsName, prop, registration) {
      var invoker = injectionMapper.find(nsName, prop.name, registration.name);
      if (!invoker) {
        invoker = typeMap[registration.type](prop.implementation, registration.params);
        injectionMapper.map(nsName, prop.name, registration.name, invoker);
      }
      return invoker;
    }

    return {
      build: build
    };
  }

  function NamespaceBuilder(configMgr, invokerBuilder) {
    var retNs = {};

    function addObject(prop) {
      var defaultInvoker,
          nsName = configMgr.getNsName();
      configMgr.getRegistrations(prop.name).forEach(function(registration) {
        var invoker = invokerBuilder.build(nsName, prop, registration);
        if (!defaultInvoker || registration.name === _default) {
          defaultInvoker = invoker;
        }
      });
      if (defaultInvoker) {
        retNs[prop.name] = defaultInvoker;
      }
    }

    function addPropertyOrFunc(prop) {
      retNs[prop.name] = prop.implementation;
    }

    function add(prop) {
      if (prop.isObject()) {
        addObject(prop);
      } else {
        addPropertyOrFunc(prop);
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

  function serve(ns, nsName, config) {
    var injectionMapper = new InjectionMapper();
    return new Processor(
      new PropertyExtractor(ns, newProperty),
      new NamespaceBuilder(
        new ConfigManager(nsName, config, new ConfigDefaulter()),
        new InvokerBuilder(
          new OrderTaker(new Maker(
            new ArgsOverrider(new ArgsWrapper()),
            new InjectionResolver(new ParamResolver(injectionMapper, newInjectionResolver))
          )),
          injectionMapper
        )
      )
    ).process(ns);
  }

  function resolve(item) {
    var resolveParam = new ResolvedParam(item),
        invoker = new InjectionMapper().find(resolveParam.namespace, resolveParam.object, resolveParam.name);
    return invoker ? invoker.apply(null, Array.prototype.slice.call(arguments || []).splice(1)) : null;
  }

  return {
    config: function() { return new Config(); },
    serve: serve,
    resolve: resolve,
    Processor: Processor,
    ArgsOverrider: ArgsOverrider,
    ArgsWrapper: ArgsWrapper,
    InjectionResolver: InjectionResolver,
    Maker: Maker,
    OrderTaker: OrderTaker,
    Property: Property,
    newProperty: newProperty,
    PropertyExtractor: PropertyExtractor,
    ConfigDefaulter: ConfigDefaulter,
    InjectionMapper: InjectionMapper,
    ResolvedParam: ResolvedParam,
    ParamResolver: ParamResolver,
    InvokerBuilder: InvokerBuilder,
    NamespaceBuilder: NamespaceBuilder,
    ConfigManager: ConfigManager
  };
};