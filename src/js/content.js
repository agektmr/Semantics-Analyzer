'use strict';

/*
Expected Microdata result:
Microdata = [
  {
    type: 'http://schema.org/Article',
    prop: [
      {
        propType: 'name',
        property: 'Eiji Kitamura',
        severity: 'info',
        child: null
      },
      {
        propType: 'image',
        property: 'http://-****-/image.png',
        severity: 'warning',
        child: null
      }
    ],
    severity: 'info',
    children: [
      {
        type: 'http://schema.org/Event',
        prop: [
          ....
        ]
      }
    ]
  }
]
*/
var SemanticsAnalyzer = {};
SemanticsAnalyzer.Microdata = (function() {
  var parseGeneric = function(itemProp) {
    return itemProp.innerHTML || undefined;
  };
  var Microdata = function() {
    this.itemScopesDone = [];
    this.itemPropsDone  = [];
  };
  Microdata.prototype = {
    startAbstraction: function() {
      var itemScopes = [],
          itemProps  = [],
          scopes     = document.querySelectorAll('*[itemscope]'),
          props      = document.querySelectorAll('*[itemprop]');
      for (var h = 0; h < props.length; h++) {
        var prop = this.createItemProp(props[h]);
        for (var i = scopes.length-1; i >= 0; i--) {
          if (scopes[i].contains(props[h])) {
            if (itemScopes[i] === undefined) {
              itemScopes[i] = this.createItemScope(scopes[i]);
            }
            itemScopes[i].prop.push(prop);
            break;
          }
        }
      }
      return itemScopes;
    },
    createItemScope: function(itemScope) {
        return {
          type: itemScope.getAttribute('itemtype'),
          prop: [],
          severity: 'info',
          children: []
        };
    },
    createItemProp: function(itemProp) {
      var node = {};
      // Auto generate method name
      var type = itemProp.getAttribute('itemprop');
      var method = 'parse'+type.charAt(0).toUpperCase()+type.slice(1);
      if (this[method]) {
        node.property = this[method](itemProp);
      } else {
        // This itemprop is apparently broken (or undefined in this extension)
        node.property = this.parseBroken(itemProp);
      }
      node.propType = type;
      node.severity = !node.property ? 'warning' : 'info';
      return node;
    },
    parseImage: function(itemProp) {
      return itemProp.src || undefined;
    },
    parseStartDate: function(itemProp) {
      return itemProp.getAttribute('datetime') || undefined;
    },
    parseUrl: function(itemProp) {
      return itemProp.href || undefined;
    },
    parseBroken: parseGeneric, // Parse broken itemProp so that the developer will know what is broken
    parseName: parseGeneric,
    parseJobTitle: parseGeneric
  };
  return function() {
    return new Microdata();
  };
})();
SemanticsAnalyzer.microformats = function() {

};
SemanticsAnalyzer.microformats.prototype = {

};
SemanticsAnalyzer.OpenGraphProtocol = function() {

};
SemanticsAnalyzer.OpenGraphProtocol.prototype = {

};

chrome.extension.onMessage.addListener(function(req, sender, callback) {
  var result = {};
  var microdata = new SemanticsAnalyzer.Microdata();
  result.Microdata = microdata.startAbstraction();
  callback(result);
});