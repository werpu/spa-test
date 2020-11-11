System.register([],(function(e){return{execute:function(){e(function(e){var t={};function s(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,s),i.l=!0,i.exports}return s.m=e,s.c=t,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)s.d(n,i,function(t){return e[t]}.bind(null,i));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=2)}([function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.MessageWrapper=void 0;var n=function(e){this.detail=e,this.bubbles=!0,this.cancelable=!0,this.composed=!0};t.MessageWrapper=n},function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Direction=void 0,function(e){e[e.UP=0]="UP",e[e.DOWN=1]="DOWN",e[e.BOTH=2]="BOTH"}(t.Direction||(t.Direction={}))},function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Broker=void 0;var n=s(0),i=s(1),r=function(){function e(t,s){var n=this;void 0===t&&(t=window),void 0===s&&(s="brokr"),this.name=s,this.messageListeners={},this.processedMessages={},this.cleanupCnt=0,this.isShadowDom=!1;var r=function(e){var t,s,r=(null===(t=e)||void 0===t?void 0:t.detail)||(null===(s=e)||void 0===s?void 0:s.data);if((null==r?void 0:r.identifier)&&(null==r?void 0:r.message)){var o=r;if(o.identifier in n.processedMessages)return;n.broadcast(o,i.Direction.DOWN,!1)}};if(t.host){var o=t.host;o.setAttribute("data-broker","1"),o.addEventListener(e.EVENT_TYPE,(function(e){return r(e)}),{capture:!0}),o.addEventListener("message",(function(e){return r(e)}),{capture:!0})}else t.addEventListener(e.EVENT_TYPE,(function(e){return r(e)}),{capture:!0}),t.addEventListener("message",(function(e){return r(e)}),{capture:!0})}return e.prototype.registerListener=function(e,t){var s=this;this.reserveListenerNS(e),this.messageListeners[e].push((function(e){e.identifier in s.processedMessages||t(e)}))},e.prototype.gcProcessedMessages=function(){if(++this.cleanupCnt%10==0){var e={};for(var t in this.processedMessages)this.processedMessages[t]<(new Date).getMilliseconds()-1e3||(e[t]=this.processedMessages[t]);this.processedMessages=e}},e.prototype.unregisterListener=function(e,t){this.messageListeners=(this.messageListeners[e]||[]).filter((function(e){return e!==t}))},e.prototype.broadcast=function(e,t,s){switch(void 0===t&&(t=i.Direction.DOWN),void 0===s&&(s=!0),t){case i.Direction.DOWN:this.dispatchDown(e,s);break;case i.Direction.UP:this.dispatchUp(e,s);break;case i.Direction.BOTH:this.dispatchBoth(e,s)}this.gcProcessedMessages()},e.prototype.dispatchBoth=function(e,t){void 0===t&&(t=!0),this.dispatchUp(e,t,!0),this.dispatchDown(e,!0,!1)},e.prototype.dispatchUp=function(e,t,s){void 0===t&&(t=!0),void 0===s&&(s=!0),t||this.callListeners(e),this.processedMessages[e.identifier]=e.creationDate,null!=window.parent&&window.parent.postMessage(e,"*"),s&&this.dispatchSameLevel(e)},e.prototype.dispatchSameLevel=function(e){var t=this.transformToEvent(e,!0);window.dispatchEvent(t)},e.prototype.dispatchDown=function(e,t,s){void 0===t&&(t=!0),void 0===s&&(s=!0),t||this.callListeners(e),this.processedMessages[e.identifier]=e.creationDate;var n=this.transformToEvent(e);window.dispatchEvent(n),document.querySelectorAll("iframe").forEach((function(t){t.contentWindow.postMessage(e,"*")})),document.querySelectorAll("[data-broker='1']").forEach((function(e){return e.dispatchEvent(n)})),s&&this.dispatchSameLevel(e)},e.prototype.callListeners=function(e){var t=this.messageListeners[e.channel];if(null==t?void 0:t.length){t.forEach((function(t){t(e)}))}},e.prototype.transformToEvent=function(t,s){void 0===s&&(s=!1);var i=new n.MessageWrapper(t);return i.bubbles=s,this.createCustomEvent(e.EVENT_TYPE,i)},e.prototype.createCustomEvent=function(e,t){if(void 0===window.CustomEvent){var s=document.createEvent("HTMLEvents");return s.detail=t.detail,s.initEvent(e,t.bubbles,t.cancelable),s}return new window.CustomEvent(e,t)},e.prototype.reserveListenerNS=function(e){this.messageListeners[e]||(this.messageListeners[e]=[]),this.messageListeners["*"]||(this.messageListeners["*"]=[])},e.EVENT_TYPE="brokerEvent",e}();t.Broker=r}]))}}}));
//# sourceMappingURL=Broker.js.map