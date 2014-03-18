var ExampleNamespace = function(depend) {
  depend = depend || {};
  var jsb = depend.JSBarista,
      ns = {};

  function GObject1(p) {
    function doSomething(it) {
      console.log('GObject1(' + p + ').doSomething(' + it + ')');
    }

    return {
      doSomething: doSomething
    };
  }

  function GObject2(p) {
    function execute(it) {
      console.log('GObject2(' + p + ').execute(' + it + ')');
    }

    return {
      execute: execute
    };
  }

  ns.GObject1 = GObject1;
  ns.GObject2 = GObject2;
  ns.barista = jsb.newBarista(ns);
  ns.barista.GObject2 = ns.barista.staticGObject2;
  return ns;
};

var ns = new ExampleNamespace({
  JSBarista: new JSBarista()
});

ns.barista.GObject1('first').doSomething('1');
ns.barista.GObject1('second').doSomething('2');
ns.barista.GObject2('1').execute('this');
ns.barista.GObject2('2').execute('that');
ns.barista.GObject2('3').execute('all');
ns.barista.GObject2().execute('stat');