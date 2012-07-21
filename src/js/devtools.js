var microdataParser = function(node, detail, auditResults) {
  var child = detail.addChild(node.propType || '');
  var content = '';
  if (node.child) {
    child.addChild(node.type);
    node.child.prop.forEach(function(childNode) {
      microdataParser(childNode, child, auditResults);
    });
  } else {
    switch (node.propType) {
      case 'url' :
        content = auditResults.createURL(node.property);
        break;
      case 'image' :
        content = auditResults.createSnippet(node.property);
        break;
      default :
        content = node.property || '';
        break;
    }
    if (node.severity == 'warning') severity = auditResults.Severity.Warning;
  }
  child.addChild(content);
};

var category = chrome.experimental.devtools.audits.addCategory('Semantics Analyzer', 3);
category.onAuditStarted.addListener(function(auditResults) {
  chrome.extension.sendRequest({
    command: 'analyze',
    tabId: chrome.devtools.inspectedWindow.tabId
  }, function(results) {
    /* Microdata */
    var length    = results.Microdata.length,
        severity  = auditResults.Severity.Info,
        details   = auditResults.createResult('Details...');
    results.Microdata.forEach(function(microdata) {
      var child = details.addChild(microdata.type);
      microdata.prop.forEach(function(node) {
        microdataParser(node, child, auditResults);
      });
    });
    auditResults.addResult('Microdata ('+length+')', '', severity, details);

    /* microformats */
    auditResults.addResult('microformats (5)',
      '5 elements use font size below 10pt',
      auditResults.Severity.Info,
      details);

    /* Open Graph Protocol */
    auditResults.addResult('Open Graph Protocol (5)',
      '5 elements use font size below 10pt',
      auditResults.Severity.Info,
      details);
    auditResults.done();
  });
});