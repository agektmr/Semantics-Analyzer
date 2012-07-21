/*
Copyright 2012 Eiji Kitamura

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eiji Kitamura (agektmr@gmail.com)
*/
var SemanticsAnalyzer = {
  analyze: function(tabId, callback) {
    chrome.tabs.executeScript(tabId, {
      file: 'js/content.js'
    }, function() {
      chrome.tabs.sendMessage(tabId, {}, function(results) {
        callback(results);
        return true;
      });
    });
  } 
};

chrome.extension.onRequest.addListener(function(req, sender, callback) {
  switch(req.command) {
    case 'analyze':
      SemanticsAnalyzer.analyze(req.tabId, callback);
      break;
    default:
      break;
  }
  return true;
});