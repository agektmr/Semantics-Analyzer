'use strict';

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
      return this.getItemScopes();
    },
    getItemScopes: function() {
      var that = this,
          results = [],
          itemScopes = document.querySelectorAll('*[itemscope]');
      Array.prototype.forEach.call(itemScopes, function(itemScope) {
        var result = that.getItemScope(itemScope);
        if (result) results.push(result);
      });
      return results;
    },
    getItemScope: function(itemScope) {
      // Check see if this itemScope has already been processed.
      var done = false;
      this.itemScopesDone.forEach(function(scope) {
        // If identical node found in done list, it's already done
        if (scope.isSameNode(itemScope)) done = true;
      });
      if (done) return null;

      this.itemScopesDone.push(itemScope);
      var that = this,
          item = {
            type: itemScope.getAttribute('itemtype'),
            prop: []
          },
          itemProps = itemScope.querySelectorAll('*[itemprop]');
      Array.prototype.forEach.call(itemProps, function(itemProp) {
        var prop = that.getItemProp(itemProp);
        if (prop) item.prop.push(prop);
      });
      return item;
    },
    getItemProp: function(itemProp) {
      // Check see if this itemScope has already been processed.
      var done = false;
      this.itemPropsDone.forEach(function(prop) {
        // If identical node found in done list, it's already done
        if (prop.isSameNode(itemProp)) done = true;
      });
      if (done) return null;

      this.itemPropsDone.push(itemProp);
      var node = {};
      var type = itemProp.getAttribute('itemprop');
      // Auto generate method name
      var method = 'parse'+type.charAt(0).toUpperCase()+type.slice(1);
      if (this[method]) {
        node.property = this[method](itemProp);
      } else {
        // This itemprop is apparently broken (or undefined in this extension)
        node.property = this.parseBroken(itemProp);
      }
      node.propType = type;
      node.severity = !node.property ? 'warning' : 'info';
      node.outerHTML = itemProp.outerHTML;
      node.child = null;
      if (itemProp.hasAttribute('itemscope')) {
        // recursive traverse
        node.type  = itemProp.getAttribute('itemtype');
        node.child = this.getItemScope(itemProp);
      }
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