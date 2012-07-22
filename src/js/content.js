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
          type: itemScope.getAttribute('itemtype'), // TODO: allow multiple types
          prop: [],
          severity: 'info',
          children: []
        };
    },
    createItemProp: function(itemProp) {
      var node = {};
      node.propType = itemProp.getAttribute('itemprop');
      switch (itemProp.nodeName) {
        case 'META':
          node.property = itemProp.content || undefined;
          break;
        case 'AUDIO':
        case 'EMBED':
        case 'IFRAME':
        case 'IMG':
        case 'SOURCE':
        case 'TRACK':
        case 'VIDEO':
          node.property = itemProp.src || undefined;
          break;
        case 'A':
        case 'AREA':
        case 'LINK':
          node.property = itemProp.href || undefined;
          break;
        case 'OBJECT':
          node.property = itemProp.data || undefined; // TODO: Check if this works
          break;
        case 'DATA':
          node.property = itemProp.value || undefined; // TODO: Check if this works
          break;
        case 'TIME':
          node.property = itemProp.getAttribute('datetime') || undefined;
          break;
        default:
          node.property = itemProp.innerHTML || undefined;
          break;
      }
      node.severity = !node.property ? 'warning' : 'info';
      return node;
    }
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