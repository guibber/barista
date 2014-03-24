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
    function intMake(implementation, args) {
      var instance = implementation.apply(this, args);
      instance.prototype = implementation.prototype;
      return instance;
    }

    function make(implementation, args) {
      return new intMake(implementation, args);
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

  function NamespaceBuilder(cashier) {
    var retNs = {};

    function addObject(prop) {
      retNs['Nbar_' + prop.name] = cashier.orderCoffee(prop.implementation);
      retNs['Sbar_' + prop.name] = cashier.orderSharedCoffee(prop.implementation);
      retNs[prop.name] = retNs['Nbar_' + prop.name];
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

  function newNamespaceBuilder(cashier) {
    return new NamespaceBuilder(cashier);
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

  function serve(ns, modsFunc) {
    var servedNs = newBarista(newPropertyExtractor(ns, newProperty), newNamespaceBuilder(newCashier(newMaker()))).serve(ns);
    if (modsFunc) {
      modsFunc(servedNs);
    }
    return servedNs;
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
    newNamespaceBuilder: newNamespaceBuilder
  };
};