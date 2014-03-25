var JsBarista = function() {
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

  function newPropertyExtractor(ns, newPropFunc) {
    return new PropertyExtractor(ns, newPropFunc);
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
    }
  }

  function newMaker() {
    return new Maker();
  }

  function Cashier(maker) {
    function orderCoffee(implementation) {
      return function() {
        return maker.make(implementation, arguments);
      };
    }

    function orderSharedCoffee(implementation) {
      var coffee;
      return function() {
        if (coffee) {
          return coffee;
        }
        coffee = maker.make(implementation, arguments);
        return coffee;
      };
    }

    return {
      orderCoffee: orderCoffee,
      orderSharedCoffee: orderSharedCoffee
    }
  }

  function newCashier(maker) {
    return new Cashier(maker);
  }

  function ConfigManager(config) {
    function get(name) {
      return config && config[name] ? config[name] : {iType: 'perdep'};
    }

    return {
      get: get
    };
  }

  function newConfigManager(config) {
    return new ConfigManager(config);
  }

  function NamespaceBuilder(cashier, configMgr) {
    var retNs = {},
        iTypeMap = {
          'perdep': function(i) { return cashier.orderCoffee(i); },
          'static': function(i) { return cashier.orderSharedCoffee(i); }
        };

    function addObject(prop) {
      retNs[prop.name] = iTypeMap[configMgr.get(prop.name).iType](prop.implementation);
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

  function newNamespaceBuilder(cashier, configMgr) {
    return new NamespaceBuilder(cashier, configMgr);
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

  function newBarista(extractor, namespaceBuilder) {
    return new Barista(extractor, namespaceBuilder);
  }

  function serve(ns, config) {
    return newBarista(newPropertyExtractor(ns, newProperty), newNamespaceBuilder(newCashier(newMaker()), newConfigManager(config))).serve(ns);
  }

  return {
    serve: serve,
    Barista: Barista,
    newBarista: newBarista,
    Maker: Maker,
    newMaker: newMaker,
    Cashier: Cashier,
    newCashier: newCashier,
    Property: Property,
    newProperty: newProperty,
    PropertyExtractor: PropertyExtractor,
    newPropertyExtractor: newPropertyExtractor,
    NamespaceBuilder: NamespaceBuilder,
    newNamespaceBuilder: newNamespaceBuilder,
    ConfigManager: ConfigManager,
    newConfigManager: newConfigManager
  };
};