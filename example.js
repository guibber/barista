var ExampleNamespace = function() {
   
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

  return {
    GObject1: GObject1,
    GObject2: GObject2
  };
};

var bar = new Barista();
var ns = bar.serve(new ExampleNamespace(), {ns: 'ExampleNamespace', GObject2: {type: 'single'}});

ns.GObject1('first').doSomething('1');
ns.GObject1('second').doSomething('2');
ns.GObject2('1').execute('this');
ns.GObject2('2').execute('that');
ns.GObject2('3').execute('all');
ns.GObject2().execute('stat');

