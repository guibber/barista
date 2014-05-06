describe('barista Performance', function() {
  var iterate = function(testFunc) {
    var i;
    for (i = 0; i < 1000000; ++i) {
      testFunc();
    }
  };
  describe('barista construct object, no dependency injection no args or params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function ObjDef1() {
          function getParam() {
            return 11;
          }
          return {getParam: getParam};
        }

        return {
          ObjDef1: ObjDef1
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.ObjDef1.register(function(item) {
          item.withEntry().perDependency();
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        new directInstance.ObjDef1();
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.ObjDef1();
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.ObjDef1._default();
      });
    });
  });

  describe('barista construct object, no dependency injection args only', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function ObjDef1() {
          function getParam() {
            return 11;
          }
          return {getParam: getParam};
        }

        return {
          ObjDef1: ObjDef1
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.ObjDef1.register(function(item) {
          item.withEntry().perDependency();
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        new directInstance.ObjDef1(11);
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.ObjDef1(11);
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.ObjDef1._default(11);
      });
    });
  });

  describe('barista construct object, no dependency injection one arg and one params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function ObjDef1() {
          function getParam() {
            return 11;
          }
          return {getParam: getParam};
        }

        return {
          ObjDef1: ObjDef1
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.ObjDef1.register(function(item) {
          item.withEntry().perDependency().withValueParam(11);
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        new directInstance.ObjDef1(11);
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.ObjDef1(11);
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.ObjDef1._default(11);
      });
    });
  });

  describe('barista construct object, no dependency injection one arg and one more params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function ObjDef1() {
          function getParam() {
            return 11;
          }
          return {getParam: getParam};
        }

        return {
          ObjDef1: ObjDef1
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.ObjDef1.register(function(item) {
          item.withEntry().perDependency().withValueParam(11).withValueParam(12);
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        new directInstance.ObjDef1(11);
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.ObjDef1(11);
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.ObjDef1._default(11);
      });
    });
  });

  describe('barista construct object, no dependency injection with one more arg than params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function ObjDef1() {
          function getParam() {
            return 11;
          }
          return {getParam: getParam};
        }

        return {
          ObjDef1: ObjDef1
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.ObjDef1.register(function(item) {
          item.withEntry().perDependency().withValueParam(11).withValueParam(12);
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        new directInstance.ObjDef1(11, 12, 13);
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.ObjDef1(11, 12, 13);
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.ObjDef1._default(11, 12, 13);
      });
    });
  });

  describe('barista call perDependency function, no dependency injection no args or params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function getParam() {
          return 11;
        }
        return {
          getParam: getParam
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.getParam.register(function(item) {
          item.withEntry().perDependency();
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        directInstance.getParam();
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.getParam();
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.getParam._default();
      });
    });
  });
  
  describe('barista call singleton function, no dependency injection no args or params', function() {
    var nsSimple,
        served,
        directInstance,
        servedInstance,
        registered;

    beforeEach(function() {
      nsSimple = function() {
        function getParam() {
          return 11;
        }
        return {
          getParam: getParam
        };
      };
      directInstance = new nsSimple(),
      served = barista.serve(function(ns) {
        ns.include(directInstance, 'ns');
      }, function(reg) {
        reg.ns.getParam.register(function(item) {
          item.withEntry().singleton();
        });
      }),
      servedInstance = served.namespaces.ns;
      registered = served.registered;
    });
    it('iterate() using new on namespace directly', function() {
      iterate(function() {
        directInstance.getParam();
      });
    });

    it('iterate() using served namespace', function() {
      iterate(function() {
        servedInstance.getParam();
      });
    });

    it('iterate() using registered', function() {
      iterate(function() {
        registered.ns.getParam._default();
      });
    });
  });
});