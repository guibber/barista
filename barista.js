var JSBarista = function() {
  function Barista() {
    var singletons = {};

    function make(obj, args) {
      var instance = obj.apply(this, args);
      instance.prototype = obj.prototype;
      return instance;
    }

    function instancePer(obj) {
      return function() {
        return new make(obj, arguments);
      };
    }

    function singleton(obj) {
      var instance;
      return function() {
        if (instance) {
          return instance;
        }
        instance = new make(obj, arguments);
        return instance;
      };
    }

    function serve(ns) {
      var barista = {};
      for (var objName in ns) {
        if (ns.hasOwnProperty(objName)) {
          barista['new' + objName] = instancePer(ns[objName]);
          singletons[objName] = new singleton(ns[objName]);
          barista['static' + objName] = singletons[objName];
          barista[objName] = barista['new' + objName];
        }
      }
      return barista;
    }

    return {
      serve: serve
    };
  };

  function newBarista(ns) {
    return new Barista().serve(ns);
  }

  return {
    Barista: Barista,
    newBarista: newBarista
  };
};
