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

  function ConfigManager(config) {
    function get(name) {
      return config && config[name] ? config[name] : {iType: 'perdep'};
    }

    return {
      get: get
    };
  }

  function NamespaceBuilder(cashier, configMgr) {
    var retNs = {},
        iTypeMap = {
          'perdep': function(i) { return cashier.orderCoffee(i); },
          'single': function(i) { return cashier.orderSharedCoffee(i); }
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
    return new Barista(new PropertyExtractor(ns, newProperty), new NamespaceBuilder(new Cashier(new Maker()), new ConfigManager(config))).serve(ns);
  }

  return {
    serve: serve,
    Barista: Barista,
    Maker: Maker,
    Cashier: Cashier,
    Property: Property,
    newProperty: newProperty,
    PropertyExtractor: PropertyExtractor,
    NamespaceBuilder: NamespaceBuilder,
    ConfigManager: ConfigManager
  };
};