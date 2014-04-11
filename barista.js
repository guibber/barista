var Barista = function(injectionMap) {
  'use strict';
  injectionMap = injectionMap || {};
  var _singleton = 'singleton',
      _perdependency = 'perdependency',
      _default = '_default';

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

    function setNsDefault(config) {
      config.ns = config.ns || 'namespace';
      return config.ns;
    }

    return {
      setNsDefault: setNsDefault,
      setRegistrationDefaults: setRegistrationDefaults
    };
  }

  function ConfigManager(config, configDefaulter) {
    config = config || {};
    function getNs() {
      return configDefaulter.setNsDefault(config);
    }

    function getRegistrations(name) {
      var registrations = config[name] || [{}];
      return Array.isArray(registrations)
        ? configDefaulter.setRegistrationDefaults(registrations)
        : configDefaulter.setRegistrationDefaults([registrations]);
    }

    return {
      getRegistrations: getRegistrations,
      getNs: getNs
    };
  }

  function Property(name, implementation) {
    function isFunction() {
      return typeof(implementation) === 'function';
    }

    function isFirstLetterCapital() {
      return (/^[A-Z]/).test(name);
    }

    function isObject() {
      return isFunction() && isFirstLetterCapital();
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
      var proto = Object(implementation.prototype) === implementation.prototype ? implementation.prototype : {}.prototype,
          obj = Object.create(proto),
          ret = implementation.apply(obj, injectionResolver.resolve(argsOverrider.override(params, args)));
      return Object(ret) === ret ? ret : obj;
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

    function build(ns, prop, registration) {
      var invoker = injectionMapper.find(ns, prop.name, registration.name);
      if (!invoker) {
        invoker = typeMap[registration.type](prop.implementation, registration.params);
        injectionMapper.map(ns, prop.name, registration.name, invoker);
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
          ns = configMgr.getNs();
      configMgr.getRegistrations(prop.name).forEach(function(registration) {
        var invoker = invokerBuilder.build(ns, prop, registration);
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

  function Barista(extractor, namespaceBuilder) {
    function serve(ns) {
      var name;
      for (name in ns) {
        if (ns.hasOwnProperty(name)) {
          namespaceBuilder.add(extractor.extract(name));
        }
      }
      return namespaceBuilder.build();
    }

    return {
      serve: serve
    };
  }

  function serve(ns, config) {
    var injectionMapper = new InjectionMapper();
    return new Barista(
      new PropertyExtractor(ns, newProperty),
      new NamespaceBuilder(
        new ConfigManager(config, new ConfigDefaulter()),
        new InvokerBuilder(
          new OrderTaker(new Maker(
            new ArgsOverrider(new ArgsWrapper()),
            new InjectionResolver(new ParamResolver(injectionMapper, newInjectionResolver))
          )),
          injectionMapper
        )
      )
    ).serve(ns);
  }

  function resolve(item) {
    var resolveParam = new ResolvedParam(item),
        invoker = new InjectionMapper().find(resolveParam.namespace, resolveParam.object, resolveParam.name);
    return invoker ? invoker.apply(null, Array.prototype.slice.call(arguments || []).splice(1)) : null;
  }

  return {
    singleton: _singleton,
    perdependency: _perdependency,
    serve: serve,
    resolve: resolve,
    Barista: Barista,
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