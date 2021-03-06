function polyfill() {
    /**
     * Object.assign()
     */
    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) {
                if (target === null || target === undefined) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }
                var to = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];
                    if (nextSource !== null && nextSource !== undefined) {
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
    /**
     * CustomEvent() constructor
     */
    (function () {
        if (typeof window.CustomEvent === "function")
            return false;
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        // @ts-ignore
        window.CustomEvent = CustomEvent;
    })();
}

var isEl = function (el) { return (el instanceof Element) || (el instanceof HTMLDocument); };
var tagRegex = /^\w*.$/;
var idRegex = /^#[\w_-]*.$/;
var classRegex = /^\.[\w_-]*.$/;
/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {HTMLElement[]}
 */
var sel = function (el) {
    // Return immediately, but in an array
    if (isEl(el))
        return [el];
    // Not an arg we understand
    if (typeof el !== "string")
        return [];
    // Tag argument, use faster search
    if (tagRegex.test(el))
        return Array.prototype.slice.call(document.getElementsByTagName(el));
    // ID argument, use faster search
    if (idRegex.test(el))
        return [document.getElementById(el.slice(1))];
    // Class argument, use faster search
    if (classRegex.test(el))
        return Array.prototype.slice.call(document.getElementsByClassName(el.slice(1)));
    // Just use querySelectorAll
    return Array.prototype.slice.call(document.querySelectorAll(el));
};
/**
 * Replicates .flat() for arrays with only a single level of depth.
 * If passed something that isn't an array, it just returns it.
 *
 * This is to handle browsers (i.e. IE) that don't support .flat().
 * @param arr
 * @return {any[]}
 */
var flattenSingle = function (arr) { return Array.isArray(arr) ? arr.reduce(function (acc, val) { return acc.concat(val); }, []) : arr; };
/**
 * Attempts to make something (usually a string) in a url-safe string.
 *
 * @param string
 * @return string
 */
var urlify = function (string) { return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, ''); };
/**
 * Generate a pretty unique ID.
 *
 * *IMPORTANT*
 *
 * This is intended to be pretty random, and fairly cryptographically
 * secure, but if you really need that I'd recommend importing a package
 * and using that; This is just a simple implementation so I can avoid
 * a dependency.
 *
 * @link https://stackoverflow.com/a/2117523
 * @returns {string}
 */
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Bind to drawers/knobs and use to resolve passed and read arguments.
 * @param user
 * @param collected
 * @param settings
 * @param stores
 */
function resolveLoadArguments(user, collected, settings, stores) {
    var _this = this;
    if (typeof user === 'object') {
        Object.keys(user).map(function (key) {
            // Skip args that have already been set
            if (!collected.has(key)) {
                if (settings.indexOf(key) > -1
                    || stores.indexOf(key) > -1) {
                    collected.set(key, user[key]);
                }
            }
        });
    }
    if (collected.size > 0) {
        collected.forEach(function (value, key) {
            /**
             * This assumes there will be no overlap, and if there is, then
             * settings will take precedence.
             */
            if (settings.indexOf(key) > -1) {
                _this.settings[key] = value;
            }
            else if (stores.indexOf(key) > -1) {
                _this.store[key] = value;
            }
        });
    }
}
/**
 * Bound to stores and settings objects to return their defaults.
 */
function getDefaults() {
    var _this = this;
    var defaults = new Map();
    Object.keys(this).map(function (key) {
        defaults.set(key, _this[key]);
    });
    return defaults;
}

function setHash(hash) {
    history.pushState(null, null, "#" + hash);
}
/**
 * Get the current hash string.
 */
function extractHash() {
    return window.location.hash.slice(1);
}
/**
 * Removes hash, if it matches hash on this Drawer.
 * @param hash string
 */
function clearHash(hash) {
    if (hash && extractHash() === hash) {
        wipeHash();
    }
}
/**
 * Removes *any* existing hash.
 */
function wipeHash() {
    history.pushState(null, null, window.location.pathname);
}
/**
 * Is this a valid hash or not?
 * @param test
 */
function isValidHash(test) {
    return (typeof test === 'string') && test.length > 0;
}
/**
 * If test is a valid hash, then run the call back with test as an argument.
 * @param test
 * @param callback
 */
function ifValidHash(test, callback) {
    if (isValidHash(test)) {
        callback(test);
    }
}

function setUpSettings(settings) {
    Object.defineProperties(settings, {
        repo: {
            value: new Map(),
            writable: true,
        },
        append: {
            value: append.bind(settings),
        },
    });
}
/**
 * This will append items to a settings item that is an array.
 *
 * Bind it to your settings object and you're off to the races.
 * @param name
 * @param row
 */
function append(name, row) {
    if (!this.repo.has(name)) {
        this.repo.set(name, [row]);
    }
    else {
        var current = this.repo.get(name);
        current.push(row);
        this.repo.set(name, current);
    }
}
function DrawerSettings() {
    var _this = this;
    setUpSettings(this);
    Object.defineProperties(this, {
        inStates: {
            value: function (state) { return _this.states.indexOf(state) > -1; },
        },
        /**
         * This is a list of states the drawer can have. The names of the terms have
         * no internal meaning: They will be used to populated `data-state` and will
         * be matched against by `hiddenStates`, but they're essentially arbitrary.
         *
         * `cycle()` will move from the current state to the next state in this list,
         * and then start again from the first item when it reaches the end.
         */
        states: {
            enumerable: true,
            get: function () { return _this.repo.get('states') || ["open", "closed"]; },
            set: function (arg) {
                if (typeof arg === 'string') {
                    append('states', arg);
                }
                else if (Array.isArray(arg)) {
                    _this.repo.set('states', arg);
                }
            }
        },
        /**
         * This is the state that the drawer should start in. If it's not set,
         * it'll default to the first state described in `states`.
         */
        initState: {
            enumerable: true,
            get: function () { return _this.repo.get('initState') || _this.states[0]; },
            set: function (arg) {
                if (typeof arg === 'string' && _this.inStates(arg)) {
                    _this.repo.set('initState', arg);
                }
                else {
                    _this.repo.set('initState', false);
                }
            }
        },
        /**
         * These are states from the `states` array that are considered "closed".
         * Without other configuration, this means that when the drawer enters one
         * of these states, it will receive the `hidden` attribute, and ann attached
         * knobs will get `aria-expanded="false"`.
         *
         * To disable this behavior, just make this an empty array.
         */
        hiddenStates: {
            enumerable: true,
            get: function () { return _this.repo.get('hiddenStates') || ["closed"]; },
            set: function (arg) {
                if (typeof arg === 'string' && _this.inStates(arg)) {
                    append('hiddenStates', arg);
                }
                else if (Array.isArray(arg)) {
                    var validHiddenStates = arg.filter(function (state) { return _this.inStates(state); });
                    _this.repo.set('hiddenStates', validHiddenStates);
                }
            }
        },
        /**
         * The hash will be appended to the URL when the Drawer is in the state
         * described in hashState. If hash is not a string with a length greater
         * than one, all hash functionality is disabled. If hash is valid, but
         * hashState is not, then the de facto hash-state will be the first non-
         * hidden state found in states.
         */
        hash: {
            enumerable: true,
            get: function () { return _this.repo.get('hash') || ''; },
            set: function (arg) {
                if (isValidHash(arg)) {
                    _this.repo.set('hash', urlify(arg));
                }
            }
        },
        /**
         * When this state is active on the drawer, the hash will be added to the
         * url, and this state will be activated if the hash is in the URL. If
         * this is set but hash is not valid, nothing will happen.
         */
        hashState: {
            enumerable: true,
            get: function () {
                if (!_this.repo.get('hashState')) {
                    var nonHiddenStates = _this.states
                        .filter(function (x) { return _this.hiddenStates.indexOf(x) < 0; });
                    return nonHiddenStates[0] || '';
                }
                return _this.repo.get('hashState');
            },
            set: function (arg) {
                if (typeof arg === 'string' && _this.inStates(arg) && _this.repo.get('hiddenState').indexOf(arg) < 0) {
                    _this.repo.set('hashState', arg);
                }
            }
        },
        /**
         * If you need better uuids, pass a callback to this function that
         * generates them.
         */
        uuid: {
            enumerable: true,
            get: function () { return _this.repo.get('uuid') || uuid; },
            set: function (arg) {
                _this.repo.set('uuid', arg);
            }
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}
function KnobSettings() {
    var _this = this;
    setUpSettings(this);
    Object.defineProperties(this, {
        /**
         * When true, clicking this knob will cycle all attached drawers.
         */
        cycle: {
            enumerable: true,
            get: function () { return _this.repo.get('cycle') || true; },
            set: function (arg) { return _this.repo.set("cycle", Boolean(arg)); },
        },
        /**
         * When true, this will enable all knob-related accessiblity featured,
         * mainly aria attributes.
         */
        accessibility: {
            enumerable: true,
            get: function () { return _this.repo.get('actions') || true; },
            set: function (arg) { return _this.repo.set('actions', Boolean(arg)); }
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/**
 * Create a new knob on an element.
 *
 * ** WARNING **
 * This will not check to see if a Knob already exists on this element; you are
 * advised to check before instantiating a new knob, i.e. with getKnob().
 * Otherwise you will likely get undesirable behavior.
 *
 * @param el
 * @param userArguments
 * @constructor
 */
function Knob(el, userArguments) {
    var _this = this;
    Object.defineProperties(this, {
        settings: {
            value: new KnobSettings(),
            writable: true,
        },
        store: {
            value: new KnobStore(),
            writable: true,
        },
        mount: {
            get: function () { return _this.store.mount; },
            set: function (element) { return _this.store.mount = element; },
        },
        actions: {
            get: function () { return _this.store.actions; },
            set: function (action) { return _this.store.actions = action; }
        },
        drawers: {
            get: function () { return _this.store.drawers; },
            set: function (drawers) { return _this.store.drawers = drawers; },
        },
        detachDrawer: {
            value: function (drawer) {
                var event = new CustomEvent('knob.drawerRemoved', {
                    detail: {
                        drawer: drawer,
                        knob: _this.mount,
                    },
                });
                _this.mount.dispatchEvent(event);
                drawer.dispatchEvent(event);
            },
        }
    });
    // Attach API
    this.mount = el;
    this.mount.knob = this;
    this.actions = handleAriaExpandedState;
    this.mount.addEventListener("knob.drawerAdded", handleDrawerAddedEvent.bind(this));
    this.mount.addEventListener("knob.drawerRemoved", handleRemovalEvent.bind(this));
    this.mount.addEventListener("drawer.knobRemoved", handleRemovalEvent.bind(this));
    this.mount.addEventListener("click", handleClick.bind(this));
    loadUserArguments.bind(this)(userArguments);
}
/**
 * Get the knob on an element.
 * @param el
 */
function getKnob(el) {
    if ("knob" in el) {
        return el.knob;
    }
    return undefined;
}
/**
 * Actions to be executed when a drawer is added to this Knob.
 * @param event
 */
function handleDrawerAddedEvent(event) {
    var api = event.detail.drawer.drawer;
    setAriaExpanded(this, api);
    setAriaControls(this, api);
}
/**
 * Actions to be executed when a drawer is removed from this Knob.
 * @param event
 */
function handleRemovalEvent(event) {
    var drawer = event.detail.drawer, type = event.type;
    switch (type) {
        case 'knob.drawerRemoved':
        case 'drawer.knobRemoved':
            if (this.drawers.has(drawer)) {
                // Turn off observation
                this.drawers.get(drawer).disconnect();
                // Remove Drawer
                this.store.repo.get('drawers').delete(drawer);
            }
            break;
    }
}
/**
 * Handle changing aria-expanded when the attached drawer is hidden
 * (or not).
 * @param list
 * @param api
 */
function handleAriaExpandedState(list, api) {
    for (var i = 0; i < list.length; i++) {
        var _a = list[i], attributeName = _a.attributeName, target = _a.target;
        if ("hidden" === attributeName) {
            setAriaExpanded(api, getDrawer(target));
        }
    }
}
/**
 * Handles setting the aria-expanded attribute on the knob.
 * @param api
 * @param drawer
 */
function setAriaExpanded(api, drawer) {
    if (api.settings.accessibility) {
        api.mount.setAttribute("aria-expanded", String(!drawer.hidden));
    }
}
/**
 * Handles setting up the aria-controls attribute on the knob.
 * @param api
 * @param drawer
 */
function setAriaControls(api, drawer) {
    if (api.settings.accessibility) {
        api.mount.setAttribute("aria-controls", drawer.mount.id);
    }
}
/**
 * Fired when the knob registers a click event.
 *
 * Only fires if `doCycle` is true. `doCycle` gets its
 * initial value from `knobsCycle` in the settings, but
 * can be independently set per knob (manually).
 */
function handleClick() {
    var _a = this, cycle = _a.settings.cycle, drawers = _a.drawers;
    if (cycle) {
        drawers.forEach(function (observer, drawer) {
            var _a;
            (_a = getDrawer(drawer)) === null || _a === void 0 ? void 0 : _a.cycle();
        });
    }
}
/**
 * Handle loading arguments passed directly, and described on the element.
 * @param userArguments
 */
function loadUserArguments(userArguments) {
    var allowedSettings = Object.keys(this.settings);
    var allowedStores = Object.keys(this.store);
    var collectedArguments = new Map();
    var dataset = this.mount.dataset;
    if (dataset.cycle)
        collectedArguments.set('cycle', dataset.cycle === "true");
    if (dataset.accessibility)
        collectedArguments.set('accessibility', dataset.accessibility === "true");
    resolveLoadArguments.bind(this)(userArguments, collectedArguments, allowedSettings, allowedStores);
}

function getImmutableMap(key, fallback) {
    if (undefined === fallback) {
        fallback = [];
    }
    return new Map(this.repo.get(key) || fallback);
}
function getImmutableArray(key, fallback) {
    if (undefined === fallback) {
        fallback = [];
    }
    var array = this.repo.get(key) || fallback;
    return __spreadArrays(array);
}
/**
 * Set up a basic store.
 * @param store
 */
function setUpStore(store) {
    Object.defineProperties(store, {
        repo: {
            value: new Map(),
            writable: true,
        },
        mapGet: {
            value: getImmutableMap.bind(store),
        },
        arrayGet: {
            value: getImmutableArray.bind(store),
        },
        mount: {
            enumerable: true,
            get: function () { return store.repo.get('mount') || undefined; },
            set: function (element) {
                // Can only be mounted once
                if (!isEl(store.repo.get('mount')) && isEl(element)) {
                    store.repo.set('mount', element);
                }
            }
        },
        actions: {
            enumerable: true,
            get: function () { return store.mapGet('actions'); },
            set: function (action) {
                // "lazy"-initialization
                if (store.actions.size < 1) {
                    store.repo.set('actions', store.actions);
                }
                var actions;
                if (Array.isArray(action)) {
                    actions = action.map(flattenSingle);
                }
                else {
                    actions = [action];
                }
                actions
                    .map(function (action) { return store.repo.get('actions')
                    .set((action.name || uuid()), action); });
            }
        },
    });
}
function DrawerStore() {
    var _this = this;
    setUpStore(this);
    Object.defineProperties(this, {
        knobs: {
            enumerable: true,
            get: function () { return _this.mapGet('knobs'); },
            set: function (arg) {
                if (_this.knobs.size < 1) {
                    _this.repo.set('knobs', _this.knobs);
                }
                var knobs;
                var settings = {};
                if (Array.isArray(arg)) {
                    knobs = flattenSingle(arg.map(sel));
                }
                else if (arg.hasOwnProperty('elements')
                    && arg.hasOwnProperty('settings')) {
                    /**
                     * This allows for passing knob settings by passing an object with
                     * the following shape:
                     * {
                     *     elements: ['selector', elementObject],
                     *     settings: {
                     *         cycle: true,
                     *         accessibility: false,
                     *         ...
                     *     }
                     * }
                     */
                    knobs = flattenSingle(arg.elements.map(sel));
                    settings = arg.settings;
                }
                else {
                    knobs = sel(arg);
                }
                knobs.map(function (knob) {
                    // Settings are only applied if this is a new Knob.
                    var api = getKnob(knob) || new Knob(knob, settings);
                    api.drawers = _this.mount; // Knob will take care of the rest
                });
            }
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}
function KnobStore() {
    var _this = this;
    setUpStore(this);
    Object.defineProperties(this, {
        drawers: {
            enumerable: true,
            get: function () { return _this.mapGet('drawers'); },
            set: function (drawer) {
                // "lazy"-initialization
                if (_this.drawers.size < 1) {
                    _this.repo.set('drawers', _this.drawers);
                }
                var drawers;
                if (Array.isArray(drawer)) {
                    drawers = drawer.map(sel).map(flattenSingle);
                }
                else {
                    drawers = sel(drawer);
                }
                drawers
                    .filter(function (drawer) {
                    return getDrawer(drawer) !== undefined;
                })
                    .map(function (drawer) {
                    // Create observer
                    var observer = new MutationObserver(function (list, observer) {
                        if (_this.repo.get('actions').size > 0) {
                            _this.repo.get('actions').forEach(function (action) {
                                action(list, _this.repo.get('mount').knob, observer);
                            });
                        }
                    });
                    // Start observer
                    observer.observe(drawer, {
                        attributes: true,
                        attributeFilter: ["data-states", "hidden"],
                        attributeOldValue: true,
                        childList: false,
                        subtree: false,
                    });
                    // Store drawer and observer
                    _this.repo.get('drawers').set(drawer, observer);
                    // Tell the Drawer that this Knob is attached
                    drawer.drawer.store.repo.get('knobs')
                        .set(_this.repo.get('mount'), _this.repo.get('mount').knob);
                    // Tell the knob we've added a drawer
                    _this.repo.get('mount').dispatchEvent(new CustomEvent('knob.drawerAdded', {
                        detail: {
                            drawer: drawer,
                        }
                    }));
                });
            },
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}

/**
 * Activate a drawer.
 * @param el
 * @param userArguments
 */
function Drawer(el, userArguments) {
    var _this = this;
    Object.defineProperties(this, {
        settings: {
            value: new DrawerSettings(),
            writable: true,
        },
        store: {
            value: new DrawerStore(),
            writable: true,
        },
        mount: {
            get: function () { return _this.store.mount; },
            set: function (mount) { return _this.store.mount = mount; },
        },
        state: {
            get: function () { return _this.mount.dataset.state; },
            set: function (state) {
                if (_this.settings.states.indexOf(state) > -1) {
                    _this.mount.dataset.state = state;
                }
            },
        },
        hidden: {
            get: function () { return _this.mount.hidden; },
            set: function (hide) { return _this.mount.hidden = Boolean(hide); },
        },
        hash: {
            get: function () { return _this.settings.hash; },
            set: function (hash) { return _this.settings.hash = hash; },
        },
        actions: {
            get: function () { return _this.store.actions; },
            set: function (action) { return _this.store.actions = action; },
        },
        knobs: {
            get: function () { return _this.store.knobs; },
            set: function (knob) { return _this.store.knobs = knob; }
        },
        hasher: {
            value: {
                setUrl: function () { return ifValidHash(_this.settings.hash, setHash); },
                clearUrl: function () { return ifValidHash(_this.settings.hash, clearHash); },
                wipeUrl: wipeHash
            },
        },
        cycle: {
            value: function (states) { return cycle(_this.mount, states); },
        },
        detachKnob: {
            value: function (knob) {
                if (_this.knobs.has(knob)) {
                    var event_1 = new CustomEvent('drawer.knobRemoved', {
                        detail: {
                            drawer: _this.mount,
                            knob: knob,
                        },
                    });
                    _this.mount.dispatchEvent(event_1);
                    knob.dispatchEvent(event_1);
                }
            }
        }
    });
    /** ==== Set up actions ==== */
    // Couple state to hidden attribute
    this.actions = hiddenCallback;
    // Set up hash actions
    this.actions = hashCallback;
    // Attach the API to the element
    this.mount = el;
    this.mount.drawer = this;
    // Ensure id
    if (!this.mount.id) {
        this.mount.id = this.settings.uuid ? this.settings.uuid() : uuid();
    }
    this.mount.addEventListener("knob.drawerRemoved", handleRemovalEvent$1.bind(this));
    this.mount.addEventListener("drawer.knobRemoved", handleRemovalEvent$1.bind(this));
    var watcher = new MutationObserver(function (list, observer) { return handleMutation.bind(_this)(list, observer); });
    this.observer = watcher.observe(this.mount, {
        attributes: true,
        attributeFilter: ["data-state", "hidden"],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });
    loadUserArguments$1.bind(this)(userArguments);
    // If there's a matching hash, set the hashState as the initState
    if (extractHash().length > 0) {
        var hash = extractHash();
        if (isValidHash(hash) && this.hash === hash && this.settings.hashState.length > 0) {
            this.settings.initState = this.settings.hashState;
        }
    }
    // Kick things off by setting the initial state
    this.state = this.settings.initState;
}
/**
 * Get the API if it exists.
 * Also useful for determining if an element has a drawer attached or not.
 * @param el
 */
function getDrawer(el) {
    if ("drawer" in el) {
        return el.drawer;
    }
    else {
        return undefined;
    }
}
/**
 * Run actions when the element mutates.
 *
 * @param list
 * @param observer
 */
function handleMutation(list, observer) {
    var _this = this;
    this.actions.forEach(function (action) { return action(list, _this, observer); });
}
/**
 * Handle removes of Knobs and Drawers from either type of element.
 * @param event
 */
function handleRemovalEvent$1(event) {
    var knob = event.detail.knob, type = event.type;
    switch (type) {
        case 'knob.drawerRemoved':
        case 'drawer.knobRemoved':
            if (this.knobs.get(knob)) {
                // Remove knob
                this.store.repo.get('knobs').delete(knob);
            }
            break;
    }
}
/**
 * Set up hidden behavior.
 * @param list
 * @param api
 */
function hiddenCallback(list, api) {
    for (var i = 0; i < list.length; i++) {
        var attributeName = list[i].attributeName;
        if ("data-state" === attributeName) {
            api.hidden = api.settings.hiddenStates.indexOf(api.state) > -1;
        }
    }
}
/**
 * Set up hash behavior.
 * @param list
 * @param api
 */
function hashCallback(list, api) {
    for (var i = 0; i < list.length; i++) {
        var attributeName = list[i].attributeName;
        var hashState = api.settings.hashState, state = api.state, _a = api.hasher, setUrl = _a.setUrl, clearUrl = _a.clearUrl;
        if ("data-state" === attributeName) {
            if (state === hashState) {
                setUrl();
            }
            else {
                clearUrl();
            }
        }
    }
}
/**
 * Cycle through all available states, looping around at the end of the array.
 * If it is passed an array of states
 */
function cycle(el, limitedStates) {
    var api = getDrawer(el);
    if (api) {
        var states = api.settings.states;
        var curIndex = states.indexOf(api.state);
        var nextState = states[curIndex + 1] || states[0];
        // If states have been passed, cycle only through those
        if (limitedStates) {
            var potentialCustomState = limitedStates[limitedStates.indexOf(api.state) + 1] || limitedStates[0];
            // Only allow valid states
            if (states.indexOf(potentialCustomState) > -1) {
                nextState = potentialCustomState;
            }
        }
        api.state = nextState;
    }
}
/**
 * Handle loading arguments passed directly, and described on the element.
 * @param userArguments
 */
function loadUserArguments$1(userArguments) {
    var allowedSettings = Object.keys(this.settings);
    var allowedStores = Object.keys(this.store);
    var collectedArguments = new Map();
    // Handle items described in element HTML
    var dataset = this.mount.dataset;
    if (dataset.state)
        collectedArguments.set('initState', dataset.state);
    if (dataset.knob)
        collectedArguments.set('knobs', dataset.knob);
    if (dataset.hash)
        collectedArguments.set('hash', dataset.hash);
    if (dataset.hashState)
        collectedArguments.set('hashState', dataset.hashState);
    resolveLoadArguments.bind(this)(userArguments, collectedArguments, allowedSettings, allowedStores);
}

// Set up our polyfills before we do anything else
polyfill();
/**
 * Set up all drawers we can find.
 * @param selector
 * @param userSettings
 */
function Cabinet(selector, userSettings) {
    var drawers = sel(selector || "[data-module=\"drawer\"]");
    if (drawers.length < 1) {
        return; // There are no drawers
    }
    return drawers.map(function (drawer) { return new Drawer(drawer, userSettings); });
}

export { Cabinet, Drawer, Knob, cycle, getDrawer, getKnob };
