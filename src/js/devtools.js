var microdataItemScopeParser = function(microdata, details, auditResults) {
  microdata.forEach(function(itemScope) {
    var child = details.addChild(itemScope.type);
    // child.expanded = true;
    itemScope.props.forEach(function(itemProp) {
      microdataItemPropParser(itemProp, child, auditResults);
    });
  });
};
var microdataItemPropParser = function(itemProp, detail, auditResults) {
  var child = detail.addChild(itemProp.type || '');
  child.expanded = true;
  if (itemProp.children.length > 0) {
    microdataItemScopeParser(itemProp.children, child, auditResults);
  } else {
    switch (itemProp.nodeName) {
      case 'A' :
      case 'AREA' :
      case 'LINK' :
      case 'AUDIO':
      case 'EMBED':
      case 'IFRAME':
      case 'IMG':
      case 'SOURCE':
      case 'TRACK':
      case 'VIDEO':
        content = auditResults.createURL(itemProp.property);
        break;
      default :
        content = itemProp.property || '';
        break;
    }
    if (itemProp.severity == 'warning') severity = auditResults.Severity.Warning;
    child.addChild(content);
  }
};

var category = chrome.experimental.devtools.audits.addCategory('Semantics Analyzer', 3);
category.onAuditStarted.addListener(function(auditResults) {
  chrome.extension.sendRequest({
    command: 'analyze',
    tabId: chrome.devtools.inspectedWindow.tabId
  }, function(results) {
console.log(results);
    /* Microdata */
    var length    = results.Microdata.length,
        severity  = auditResults.Severity.Info,
        details   = auditResults.createResult('Details...');
    details.expanded = true;
    microdataItemScopeParser(results.Microdata, details, auditResults);
    auditResults.addResult('Microdata ('+length+')', '', severity, details);

    /* microformats */
    // auditResults.addResult('microformats (0)', '', auditResults.Severity.Info, details);

    /* Open Graph Protocol */
    // auditResults.addResult('Open Graph Protocol (0)', '', auditResults.Severity.Info, details);

    auditResults.done();
  });
});