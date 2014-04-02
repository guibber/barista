var JsBarista = function(injectionMap) {
  injectionMap = injectionMap || {};

  function InjectionMapper(overrideMap) {
    injectionMap = overrideMap || injectionMap;

    function getRegName(regName) {
      return regName ? regName : '_default';
    }

    function getChild(parent, childName, empty) {
      return parent
        ? parent[childName]
          ? parent[childName] : empty
        : empty;
    }

    function find(sourceNsName, objName, regName) {
      var sourceNs = getChild(injectionMap, sourceNsName),
          obj = getChild(sourceNs, objName);

      return getChild(obj, getRegName(regName));
    }

    function map(sourceNsName, objName, regName, invoker) {
      var sourceNs = getChild(injectionMap, sourceNsName, {}),
          obj = getChild(sourceNs, objName, {});
      injectionMap[sourceNsName] = sourceNs;
      sourceNs[objName] = obj;
      obj[getRegName(regName)] = invoker;
    }

    return {
      find: find,
      map: map
    };
  }

  function Property(name, implementation) {
    function isFunction() {
      return typeof(implementation) === 'function';
    }

    function isFirstLetterCapital() {
      return /^[A-Z]/.test(name);
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

  function Maker() {
    function make(implementation, args) {
      var proto = Object(implementation.prototype) === implementation.prototype ? implementation.prototype : Object.prototype,
          obj = Object.create(proto),
          ret = implementation.apply(obj, args);
      return Object(ret) === ret ? ret : obj;
    }

    return {
      make: make
    };
  }

  function OrderTaker(maker) {
    function orderPerDependency(implementation, params) {
      return function() {
        return maker.make(implementation, arguments);
      };
    }

    function orderSingleton(implementation, params) {
      var instance;
      return function() {
        if (instance) {
          return instance;
        }
        instance = maker.make(implementation, arguments);
        return instance;
      };
    }

    return {
      orderPerDependency: orderPerDependency,
      orderSingleton: orderSingleton
    };
  }

  function ConfigDefaulter() {
    function setRegistrationDefaults(registrations) {
      registrations.forEach(function(registration) {
        registration.type = registration.type ? registration.type : 'perdep';
        registration.name = registration.name ? registration.name : '_default';
      });
      return registrations;
    }

    function setNsDefault(config) {
      config.ns = config.ns ? config.ns : 'namespace';
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
      var registrations = config[name] ? config[name] : [{}];
      if (Array.isArray(registrations)) {
        return configDefaulter.setRegistrationDefaults(registrations);
      }
      return configDefaulter.setRegistrationDefaults([registrations]);
    }

    return {
      getRegistrations: getRegistrations,
      getNs: getNs
    };
  }

  function InvokerBuilder(orderTaker, injectionMapper) {
    var typeMap = {
      'perdep': function(i, p) { return orderTaker.orderPerDependency(i, p); },
      'single': function(i, p) { return orderTaker.orderSingleton(i, p); }
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
        if (!defaultInvoker || registration.name === '_default') {
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
      for (var name in ns) {
        namespaceBuilder.add(extractor.extract(name));
      }
      return namespaceBuilder.build();
    }

    return {
      serve: serve
    };
  };

  function serve(ns, config) {
    return new Barista(
      new PropertyExtractor(ns, newProperty),
      new NamespaceBuilder(
        new ConfigManager(config, new ConfigDefaulter()),
        new InvokerBuilder(
          new OrderTaker(new Maker()),
          new InjectionMapper()
        )
      )
    ).serve(ns);
  }

  return {
    serve: serve,
    Barista: Barista,
    Maker: Maker,
    OrderTaker: OrderTaker,
    Property: Property,
    newProperty: newProperty,
    PropertyExtractor: PropertyExtractor,
    ConfigDefaulter: ConfigDefaulter,
    InjectionMapper: InjectionMapper,
    InvokerBuilder: InvokerBuilder,
    NamespaceBuilder: NamespaceBuilder,
    ConfigManager: ConfigManager
  };
};