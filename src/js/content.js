'use strict';

/*
Expected Microdata result:
Microdata = [
  {
    type: 'http://schema.org/Article',
    prop: [
      {
        type: 'name',
        property: 'Eiji Kitamura',
        severity: 'info',
        children: null
      },
      {
        type: 'image',
        property: 'http://-****-/image.png',
        severity: 'warning',
        children: [
          {
            type: 'http://schema.org/Event',
            prop: [
              ....
            ]
          }
        ]
      }
    ],
    severity: 'info'
  }
]
*/
var SemanticsAnalyzer = {};
SemanticsAnalyzer.Microdata = function() {
};
SemanticsAnalyzer.Microdata.prototype = {
  startAbstraction: function() {
    var referenced = [], // array of referenced itemscopes contained in other itemprop
        itemScopes = [],
        itemProps  = [],
        scopes     = document.querySelectorAll('*[itemscope]'),
        props      = document.querySelectorAll('*[itemprop]');
    for (var i = 0; i < scopes.length; i++) {
      itemScopes[i] = this.createItemScope(scopes[i]);
    }
    // for (var j = props.length-1; j >= 0; j--) {
    for (var j = 0; j < props.length; j++) {
      var prop = this.createItemProps(props[j]);
      var contained = false;
      for (var k = scopes.length-1; k >= 0; k--) {
        var itemRefs = [],
            itemRef = scopes[k].getAttribute('itemref');
        if (itemRef) itemRefs = itemRef.split(' ');
        if (scopes[k].isSameNode(props[j])) {
          // append as child itemScope
          prop[0].children.push(itemScopes[k]);
          // prepend referenced index
          referenced.unshift(k);
        } else if (scopes[k].contains(props[j])) {
          itemScopes[k].props = itemScopes[k].props.concat(prop);
          contained = true;
          break;
        } else {
          // look for itemref reference if exists
          for (var l = 0; l < itemRefs.length; l++) {
            var ref = document.getElementById(itemRefs[l]);
            if (ref && ref.contains(props[j])) {
              itemScopes[k].props = itemScopes[k].props.concat(prop);
              contained = true;
              break;
            }
          }
        }
      }
      // if (!scoped) // indicate severity warning
    }
    // Remove referenced itemScopes
    referenced.forEach(function(ref) {
      itemScopes.splice(ref, 1);
    });
    return itemScopes;
  },
  createItemScope: function(itemScope) {
      return {
        id: itemScope.getAttribute('itemid') || '',
        type: itemScope.getAttribute('itemtype') || 'No itemType specified',
        props: [],
        severity: 'info'
      };
  },
  createItemProps: function(itemProp) {
    var type = itemProp.getAttribute('itemprop');
    if (!type) return [];
    var types = type.split(' ');
    var props = [];
    for (var i = 0; i < types.length; i++) {
      var prop = {};
      prop.type = types[i];
      prop.nodeName = itemProp.nodeName;
      switch (prop.nodeName) {
        case 'META':
          prop.property = itemProp.content || undefined;
          break;
        case 'AUDIO':
        case 'EMBED':
        case 'IFRAME':
        case 'IMG':
        case 'SOURCE':
        case 'TRACK':
        case 'VIDEO':
          prop.property = itemProp.src || undefined;
          break;
        case 'A':
        case 'AREA':
        case 'LINK':
          prop.property = itemProp.href || undefined;
          break;
        case 'OBJECT':
          prop.property = itemProp.data || undefined; // TODO: Check if this works
          break;
        case 'DATA':
          prop.property = itemProp.getAttribute('value') || undefined;
          break;
        case 'TIME':
          prop.property = itemProp.getAttribute('datetime') || undefined;
          break;
        default:
          prop.property = itemProp.textContent || undefined;
          break;
      }
      prop.severity = !prop.property ? 'warning' : 'info';
      prop.children = [];
      props.push(prop);
    }
    return props;
  }
};
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