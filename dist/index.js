parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"Es8J":[function(require,module,exports) {
"use strict";function e(){"function"!=typeof Object.assign&&Object.defineProperty(Object,"assign",{value:function(e,t){if(null==e)throw new TypeError("Cannot convert undefined or null to object");for(var n=Object(e),o=1;o<arguments.length;o++){var r=arguments[o];if(null!=r)for(var u in r)Object.prototype.hasOwnProperty.call(r,u)&&(n[u]=r[u])}return n},writable:!0,configurable:!0}),function(){if("function"==typeof window.CustomEvent)return!1;window.CustomEvent=function(e,t){t=t||{bubbles:!1,cancelable:!1,detail:null};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}}()}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"BHXf":[function(require,module,exports) {
"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.resolveLoadArguments=exports.getDefaults=exports.uuid=exports.urlify=exports.flattenSingle=exports.sel=exports.isEl=void 0;var t=function(e){return e instanceof Element||e instanceof HTMLDocument};exports.isEl=t;var r=/^\w*.$/,o=/^#[\w_-]*.$/,n=/^\.[\w_-]*.$/,s=function(e){return t(e)?[e]:"string"!=typeof e?[]:r.test(e)?Array.prototype.slice.call(document.getElementsByTagName(e)):o.test(e)?[document.getElementById(e.slice(1))]:n.test(e)?Array.prototype.slice.call(document.getElementsByClassName(e.slice(1))):Array.prototype.slice.call(document.querySelectorAll(e))};exports.sel=s;var x=function(e){return e.reduce(function(e,t){return e.concat(t)},[])};exports.flattenSingle=x;var c=function(e){return e.toString().toLowerCase().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,"")};function u(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)})}function i(t,r,o,n){var s=this;"object"===e(t)&&Object.keys(t).map(function(e){r.has(e)||(o.indexOf(e)>-1||n.indexOf(e)>-1)&&r.set(e,t[e])}),r.size>0&&r.forEach(function(e,t){o.indexOf(t)>-1?s.settings[t]=e:n.indexOf(t)>-1&&(s.store[t]=e)})}function l(){var e=this,t=new Map;return Object.keys(this).map(function(r){t.set(r,e[r])}),t}exports.urlify=c,exports.uuid=u,exports.resolveLoadArguments=i,exports.getDefaults=l;
},{}],"Ypkl":[function(require,module,exports) {
"use strict";function t(t){history.pushState(null,null,"#"+t)}function s(){return window.location.hash.slice(1)}function e(t){t&&s()===t&&o()}function o(){history.pushState(null,null,window.location.pathname)}function a(t){return"string"==typeof t&&t.length>0}function i(t,s){a(t)&&s(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.ifValidHash=exports.isValidHash=exports.wipeHash=exports.clearHash=exports.extractHash=exports.setHash=void 0,exports.setHash=t,exports.extractHash=s,exports.clearHash=e,exports.wipeHash=o,exports.isValidHash=a,exports.ifValidHash=i;
},{}],"NYkG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.KnobSettings=exports.DrawerSettings=void 0;var e=require("./hash"),t=require("./util");function n(e){Object.defineProperties(e,{repo:{value:new Map,writable:!0},append:{value:r.bind(e)}})}function r(e,t){if(this.repo.has(e)){var n=this.repo.get(e);n.push(t),this.repo.set(e,n)}else this.repo.set(e,[t])}function i(){var i=this;n(this),Object.defineProperties(this,{inStates:{value:function(e){return i.states.indexOf(e)>-1}},states:{enumerable:!0,get:function(){return i.repo.get("states")||["open","closed"]},set:function(e){"string"==typeof e?r("states",e):Array.isArray(e)&&i.repo.set("states",e)}},initState:{enumerable:!0,get:function(){return i.repo.get("initState")||i.states[0]},set:function(e){"string"==typeof e&&i.inStates(e)?i.repo.set("initState",e):i.repo.set("initState",!1)}},hiddenStates:{enumerable:!0,get:function(){return i.repo.get("hiddenStates")||["closed"]},set:function(e){if("string"==typeof e&&i.inStates(e))r("hiddenStates",e);else if(Array.isArray(e)){var t=e.filter(function(e){return i.inStates(e)});i.repo.set("hiddenStates",t)}}},hash:{enumerable:!0,get:function(){return i.repo.get("hash")||""},set:function(n){e.isValidHash(n)&&i.repo.set("hash",t.urlify(n))}},hashState:{enumerable:!0,get:function(){return i.repo.get("hashState")?i.repo.get("hashState"):i.states.filter(function(e){return i.hiddenStates.indexOf(e)<0})[0]||""},set:function(e){"string"==typeof e&&i.inStates(e)&&i.repo.get("hiddenState").indexOf(e)<0&&i.repo.set("hashState",e)}},uuid:{enumerable:!0,get:function(){return i.repo.get("uuid")||t.uuid},set:function(e){i.repo.set("uuid",e)}}}),Object.defineProperty(this,"defaults",{value:t.getDefaults.bind(this)()})}function s(){var e=this;n(this),Object.defineProperties(this,{cycle:{enumerable:!0,get:function(){return e.repo.get("cycle")||!0},set:function(t){return e.repo.set("cycle",Boolean(t))}},accessibility:{enumerable:!0,get:function(){return e.repo.get("actions")||!0},set:function(t){return e.repo.set("actions",Boolean(t))}}}),Object.defineProperty(this,"defaults",{value:t.getDefaults.bind(this)()})}exports.DrawerSettings=i,exports.KnobSettings=s;
},{"./hash":"Ypkl","./util":"BHXf"}],"Oq9n":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getKnob=exports.Knob=void 0;var t=require("./util"),e=require("./settings"),n=require("./stores"),r=require("./drawer");function i(t,r){var i=this;Object.defineProperties(this,{settings:{value:new e.KnobSettings,writable:!0},store:{value:new n.KnobStore,writable:!0},mount:{get:function(){return i.store.mount},set:function(t){return i.store.mount=t}},actions:{get:function(){return i.store.actions},set:function(t){return i.store.actions=t}},drawers:{get:function(){return i.store.drawers},set:function(t){return i.store.drawers=t}},detachDrawer:{value:function(t){var e=new CustomEvent("knob.drawerRemoved",{detail:{drawer:t,knob:i.mount}});i.mount.dispatchEvent(e),t.dispatchEvent(e)}}}),this.mount=t,this.mount.knob=this,this.actions=d,this.mount.addEventListener("knob.drawerAdded",o.bind(this)),this.mount.addEventListener("knob.drawerRemoved",a.bind(this)),this.mount.addEventListener("drawer.knobRemoved",a.bind(this)),this.mount.addEventListener("click",b.bind(this)),h.bind(this)(r)}function s(t){if("knob"in t)return t.knob}function o(t){var e=t.detail.drawer.drawer;c(this,e),u(this,e)}function a(t){var e=t.detail.drawer;switch(t.type){case"knob.drawerRemoved":case"drawer.knobRemoved":this.drawers.has(e)&&(this.drawers.get(e).disconnect(),this.store.repo.get("drawers").delete(e))}}function d(t,e){for(var n=0;n<t.length;n++){var i=t[n],s=i.attributeName,o=i.target;"hidden"===s&&c(e,r.getDrawer(o))}}function c(t,e){t.settings.accessibility&&t.mount.setAttribute("aria-expanded",String(!e.hidden))}function u(t,e){t.settings.accessibility&&t.mount.setAttribute("aria-controls",e.mount.id)}function b(){var t=this.settings.cycle,e=this.drawers;t&&e.forEach(function(t,e){var n;null===(n=r.getDrawer(e))||void 0===n||n.cycle()})}function h(e){var n=Object.keys(this.settings),r=Object.keys(this.store),i=new Map,s=this.mount.dataset;s.cycle&&i.set("cycle","true"===s.cycle),s.accessibility&&i.set("accessibility","true"===s.accessibility),t.resolveLoadArguments.bind(this)(e,i,n,r)}exports.Knob=i,exports.getKnob=s;
},{"./util":"BHXf","./settings":"NYkG","./stores":"Ad32","./drawer":"RCnS"}],"Ad32":[function(require,module,exports) {
"use strict";var e=this&&this.__spreadArrays||function(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;var n=Array(e),o=0;for(t=0;t<r;t++)for(var s=arguments[t],i=0,a=s.length;i<a;i++,o++)n[o]=s[i];return n};Object.defineProperty(exports,"__esModule",{value:!0}),exports.DrawerStore=exports.KnobStore=void 0;var t=require("./util"),r=require("./knob"),n=require("./drawer");function o(e,t){return void 0===t&&(t=[]),new Map(this.repo.get(e)||t)}function s(t,r){void 0===r&&(r=[]);var n=this.repo.get(t)||r;return e(n)}function i(e){Object.defineProperties(e,{repo:{value:new Map,writable:!0},mapGet:{value:o.bind(e)},arrayGet:{value:s.bind(e)},mount:{enumerable:!0,get:function(){return e.repo.get("mount")||void 0},set:function(r){!t.isEl(e.repo.get("mount"))&&t.isEl(r)&&e.repo.set("mount",r)}},actions:{enumerable:!0,get:function(){return e.mapGet("actions")},set:function(r){e.actions.size<1&&e.repo.set("actions",e.actions),(Array.isArray(r)?r.map(t.flattenSingle):[r]).map(function(r){return e.repo.get("actions").set(r.name||t.uuid(),r)})}}})}function a(){var e=this;i(this),Object.defineProperties(this,{knobs:{enumerable:!0,get:function(){return e.mapGet("knobs")},set:function(n){var o;e.knobs.size<1&&e.repo.set("knobs",e.knobs);var s={};Array.isArray(n)?o=t.flattenSingle(n.map(t.sel)):n.hasOwnProperty("elements")&&n.hasOwnProperty("settings")?(o=t.flattenSingle(n.elements.map(t.sel)),s=n.settings):o=t.sel(n),o.map(function(t){(r.getKnob(t)||new r.Knob(t,s)).drawers=e.mount})}}}),Object.defineProperty(this,"defaults",{value:t.getDefaults.bind(this)()})}function u(){var e=this;i(this),Object.defineProperties(this,{drawers:{enumerable:!0,get:function(){return e.mapGet("drawers")},set:function(r){e.drawers.size<1&&e.repo.set("drawers",e.drawers),(Array.isArray(r)?r.map(t.sel).map(t.flattenSingle):t.sel(r)).filter(function(e){return void 0!==n.getDrawer(e)}).map(function(t){var r=new MutationObserver(function(t,r){e.repo.get("actions").size>0&&e.repo.get("actions").forEach(function(n){n(t,e.repo.get("mount").knob,r)})});r.observe(t,{attributes:!0,attributeFilter:["data-states","hidden"],attributeOldValue:!0,childList:!1,subtree:!1}),e.repo.get("drawers").set(t,r),t.drawer.store.repo.get("knobs").set(e.repo.get("mount"),e.repo.get("mount").knob),e.repo.get("mount").dispatchEvent(new CustomEvent("knob.drawerAdded",{detail:{drawer:t}}))})}}}),Object.defineProperty(this,"defaults",{value:t.getDefaults.bind(this)()})}exports.DrawerStore=a,exports.KnobStore=u;
},{"./util":"BHXf","./knob":"Oq9n","./drawer":"RCnS"}],"RCnS":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.cycle=exports.getDrawer=exports.Drawer=void 0;var t=require("./util"),e=require("./settings"),s=require("./hash"),n=require("./stores");function i(i,r){var f=this;Object.defineProperties(this,{settings:{value:new e.DrawerSettings,writable:!0},store:{value:new n.DrawerStore,writable:!0},mount:{get:function(){return f.store.mount},set:function(t){return f.store.mount=t}},state:{get:function(){return f.mount.dataset.state},set:function(t){f.settings.states.indexOf(t)>-1&&(f.mount.dataset.state=t)}},hidden:{get:function(){return f.mount.hidden},set:function(t){return f.mount.hidden=Boolean(t)}},hash:{get:function(){return f.settings.hash},set:function(t){return f.settings.hash=t}},actions:{get:function(){return f.store.actions},set:function(t){return f.store.actions=t}},knobs:{get:function(){return f.store.knobs},set:function(t){return f.store.knobs=t}},hasher:{value:{setUrl:function(){return s.ifValidHash(f.settings.hash,s.setHash)},clearUrl:function(){return s.ifValidHash(f.settings.hash,s.clearHash)},wipeUrl:s.wipeHash}},cycle:{value:function(t){return d(f.mount,t)}},detachKnob:{value:function(t){if(f.knobs.has(t)){var e=new CustomEvent("drawer.knobRemoved",{detail:{drawer:f.mount,knob:t}});f.mount.dispatchEvent(e),t.dispatchEvent(e)}}}}),this.actions=h,this.actions=u,this.mount=i,this.mount.drawer=this,this.mount.id||(this.mount.id=this.settings.uuid?this.settings.uuid():t.uuid()),this.mount.addEventListener("knob.drawerRemoved",o.bind(this)),this.mount.addEventListener("drawer.knobRemoved",o.bind(this));var b=new MutationObserver(function(t,e){return a.bind(f)(t,e)});if(this.observer=b.observe(this.mount,{attributes:!0,attributeFilter:["data-state","hidden"],attributeOldValue:!0,childList:!1,subtree:!1}),c.bind(this)(r),s.extractHash().length>0){var l=s.extractHash();s.isValidHash(l)&&this.getHash()===l&&this.getHashState().length>0&&(this.settings.initState=this.getHashState())}this.state=this.settings.initState}function r(t){return"drawer"in t?t.drawer:void 0}function a(t,e){var s=this;this.actions.forEach(function(n){return n(t,s,e)})}function o(t){var e=t.detail.knob;switch(t.type){case"knob.drawerRemoved":case"drawer.knobRemoved":this.knobs.get(e)&&this.store.repo.get("knobs").delete(e)}}function h(t,e){for(var s=0;s<t.length;s++){"data-state"===t[s].attributeName&&(e.hidden=e.settings.hiddenStates.indexOf(e.state)>-1)}}function u(t,e){for(var s=0;s<t.length;s++){var n=t[s].attributeName,i=e.settings.hashState,r=e.state,a=e.hasher,o=a.setUrl,h=a.clearUrl;"data-state"===n&&(r===i?o():h())}}function d(t,e){var s=r(t);if(s){var n=s.settings.states,i=n.indexOf(s.state),a=n[i+1]||n[0];if(e){var o=e[e.indexOf(s.state)+1]||e[0];n.indexOf(o)>-1&&(a=o)}s.state=a}}function c(e){var s=Object.keys(this.settings),n=Object.keys(this.store),i=new Map,r=this.mount.dataset;r.state&&i.set("initState",r.state),r.knob&&i.set("knobs",r.knob),r.hash&&i.set("hash",r.hash),r.hashState&&i.set("hashState",r.hashState),t.resolveLoadArguments.bind(this)(e,i,s,n)}exports.Drawer=i,exports.getDrawer=r,exports.cycle=d;
},{"./util":"BHXf","./settings":"NYkG","./hash":"Ypkl","./stores":"Ad32"}],"QCba":[function(require,module,exports) {
"use strict";var e=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.getKnob=exports.Knob=exports.cycle=exports.getDrawer=exports.Drawer=exports.Cabinet=void 0;var r=e(require("./polyfills")),t=require("./util"),n=require("./drawer");Object.defineProperty(exports,"Drawer",{enumerable:!0,get:function(){return n.Drawer}}),Object.defineProperty(exports,"getDrawer",{enumerable:!0,get:function(){return n.getDrawer}}),Object.defineProperty(exports,"cycle",{enumerable:!0,get:function(){return n.cycle}});var o=require("./knob");function u(e,r){var o=t.sel(e||'[data-module="drawer"]');if(!(o.length<1))return o.map(function(e){return new n.Drawer(e,r)})}Object.defineProperty(exports,"Knob",{enumerable:!0,get:function(){return o.Knob}}),Object.defineProperty(exports,"getKnob",{enumerable:!0,get:function(){return o.getKnob}}),r.default(),exports.Cabinet=u;
},{"./polyfills":"Es8J","./util":"BHXf","./drawer":"RCnS","./knob":"Oq9n"}]},{},["QCba"], null)
//# sourceMappingURL=/index.js.map