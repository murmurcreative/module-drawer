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

const isEl = (el) => (el instanceof Element) || (el instanceof HTMLDocument);
const tagRegex = /^\w*.$/;
const idRegex = /^#[\w_-]*.$/;
const classRegex = /^\.[\w_-]*.$/;
/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {HTMLElement[]}
 */
const sel = (el) => {
    // Return immediately, but in an array
    if (isEl(el))
        return [el];
    // Not an arg we understand
    if (typeof el !== `string`)
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
const flattenSingle = (arr) => Array.isArray(arr) ? arr.reduce((acc, val) => acc.concat(val), []) : arr;
/**
 * Attempts to make something (usually a string) in a url-safe string.
 *
 * @param string
 * @return string
 */
const urlify = (string) => string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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
    if (typeof user === 'object') {
        Object.keys(user).map((key) => {
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
        collected.forEach((value, key) => {
            /**
             * This assumes there will be no overlap, and if there is, then
             * settings will take precedence.
             */
            if (settings.indexOf(key) > -1) {
                this.settings[key] = value;
            }
            else if (stores.indexOf(key) > -1) {
                this.store[key] = value;
            }
        });
    }
}
/**
 * Bound to stores and settings objects to return their defaults.
 */
function getDefaults() {
    const defaults = new Map();
    Object.keys(this).map(key => {
        defaults.set(key, this[key]);
    });
    return defaults;
}

function setHash(hash) {
    history.pushState(null, null, `#${hash}`);
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
        let current = this.repo.get(name);
        current.push(row);
        this.repo.set(name, current);
    }
}
function DrawerSettings() {
    setUpSettings(this);
    Object.defineProperties(this, {
        inStates: {
            value: (state) => this.states.indexOf(state) > -1,
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
            get: () => this.repo.get('states') || [`open`, `closed`],
            set: (arg) => {
                if (typeof arg === 'string') {
                    append('states', arg);
                }
                else if (Array.isArray(arg)) {
                    this.repo.set('states', arg);
                }
            }
        },
        /**
         * This is the state that the drawer should start in. If it's not set,
         * it'll default to the first state described in `states`.
         */
        initState: {
            enumerable: true,
            get: () => this.repo.get('initState') || this.states[0],
            set: (arg) => {
                if (typeof arg === 'string' && this.inStates(arg)) {
                    this.repo.set('initState', arg);
                }
                else {
                    this.repo.set('initState', false);
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
            get: () => this.repo.get('hiddenStates') || [`closed`],
            set: (arg) => {
                if (typeof arg === 'string' && this.inStates(arg)) {
                    append('hiddenStates', arg);
                }
                else if (Array.isArray(arg)) {
                    const validHiddenStates = arg.filter(state => this.inStates(state));
                    this.repo.set('hiddenStates', validHiddenStates);
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
            get: () => this.repo.get('hash') || '',
            set: (arg) => {
                if (isValidHash(arg)) {
                    this.repo.set('hash', urlify(arg));
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
            get: () => {
                if (!this.repo.get('hashState')) {
                    const nonHiddenStates = this.states
                        .filter(x => this.hiddenStates.indexOf(x) < 0);
                    return nonHiddenStates[0] || '';
                }
                return this.repo.get('hashState');
            },
            set: (arg) => {
                if (typeof arg === 'string' && this.inStates(arg) && this.repo.get('hiddenState').indexOf(arg) < 0) {
                    this.repo.set('hashState', arg);
                }
            }
        },
        /**
         * If you need better uuids, pass a callback to this function that
         * generates them.
         */
        uuid: {
            enumerable: true,
            get: () => this.repo.get('uuid') || uuid,
            set: (arg) => {
                this.repo.set('uuid', arg);
            }
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}
function KnobSettings() {
    setUpSettings(this);
    Object.defineProperties(this, {
        /**
         * When true, clicking this knob will cycle all attached drawers.
         */
        cycle: {
            enumerable: true,
            get: () => this.repo.get('cycle') || true,
            set: (arg) => this.repo.set(`cycle`, Boolean(arg)),
        },
        /**
         * When true, this will enable all knob-related accessiblity featured,
         * mainly aria attributes.
         */
        accessibility: {
            enumerable: true,
            get: () => this.repo.get('actions') || true,
            set: (arg) => this.repo.set('actions', Boolean(arg))
        },
    });
    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
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
            get: () => this.store.mount,
            set: (element) => this.store.mount = element,
        },
        actions: {
            get: () => this.store.actions,
            set: (action) => this.store.actions = action
        },
        drawers: {
            get: () => this.store.drawers,
            set: (drawers) => this.store.drawers = drawers,
        },
        detachDrawer: {
            value: (drawer) => {
                const event = new CustomEvent('knob.drawerRemoved', {
                    detail: {
                        drawer: drawer,
                        knob: this.mount,
                    },
                });
                this.mount.dispatchEvent(event);
                drawer.dispatchEvent(event);
            },
        }
    });
    // Attach API
    this.mount = el;
    this.mount.knob = this;
    this.actions = handleAriaExpandedState;
    this.mount.addEventListener(`knob.drawerAdded`, handleDrawerAddedEvent.bind(this));
    this.mount.addEventListener(`knob.drawerRemoved`, handleRemovalEvent.bind(this));
    this.mount.addEventListener(`drawer.knobRemoved`, handleRemovalEvent.bind(this));
    this.mount.addEventListener(`click`, handleClick.bind(this));
    loadUserArguments.bind(this)(userArguments);
}
/**
 * Get the knob on an element.
 * @param el
 */
function getKnob(el) {
    if (`knob` in el) {
        return el.knob;
    }
    return undefined;
}
/**
 * Actions to be executed when a drawer is added to this Knob.
 * @param event
 */
function handleDrawerAddedEvent(event) {
    const { drawer: api } = event.detail.drawer;
    setAriaExpanded(this, api);
    setAriaControls(this, api);
}
/**
 * Actions to be executed when a drawer is removed from this Knob.
 * @param event
 */
function handleRemovalEvent(event) {
    const { detail: { drawer }, type } = event;
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
    for (let i = 0; i < list.length; i++) {
        const { attributeName, target } = list[i];
        if (`hidden` === attributeName) {
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
        api.mount.setAttribute(`aria-expanded`, String(!drawer.hidden));
    }
}
/**
 * Handles setting up the aria-controls attribute on the knob.
 * @param api
 * @param drawer
 */
function setAriaControls(api, drawer) {
    if (api.settings.accessibility) {
        api.mount.setAttribute(`aria-controls`, drawer.mount.id);
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
    const { settings: { cycle }, drawers } = this;
    if (cycle) {
        drawers.forEach((observer, drawer) => {
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
    const allowedSettings = Object.keys(this.settings);
    const allowedStores = Object.keys(this.store);
    const collectedArguments = new Map();
    const { dataset } = this.mount;
    if (dataset.cycle)
        collectedArguments.set('cycle', dataset.cycle === `true`);
    if (dataset.accessibility)
        collectedArguments.set('accessibility', dataset.accessibility === `true`);
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
    const array = this.repo.get(key) || fallback;
    return [...array];
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
            get: () => store.repo.get('mount') || undefined,
            set: (element) => {
                // Can only be mounted once
                if (!isEl(store.repo.get('mount')) && isEl(element)) {
                    store.repo.set('mount', element);
                }
            }
        },
        actions: {
            enumerable: true,
            get: () => store.mapGet('actions'),
            set: (action) => {
                // "lazy"-initialization
                if (store.actions.size < 1) {
                    store.repo.set('actions', store.actions);
                }
                let actions;
                if (Array.isArray(action)) {
                    actions = action.map(flattenSingle);
                }
                else {
                    actions = [action];
                }
                actions
                    .map((action) => store.repo.get('actions')
                    .set((action.name || uuid()), action));
            }
        },
    });
}
function DrawerStore() {
    setUpStore(this);
    Object.defineProperties(this, {
        knobs: {
            enumerable: true,
            get: () => this.mapGet('knobs'),
            set: (arg) => {
                if (this.knobs.size < 1) {
                    this.repo.set('knobs', this.knobs);
                }
                let knobs;
                let settings = {};
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
                knobs.map((knob) => {
                    // Settings are only applied if this is a new Knob.
                    const api = getKnob(knob) || new Knob(knob, settings);
                    api.drawers = this.mount; // Knob will take care of the rest
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
    setUpStore(this);
    Object.defineProperties(this, {
        drawers: {
            enumerable: true,
            get: () => this.mapGet('drawers'),
            set: (drawer) => {
                // "lazy"-initialization
                if (this.drawers.size < 1) {
                    this.repo.set('drawers', this.drawers);
                }
                let drawers;
                if (Array.isArray(drawer)) {
                    drawers = drawer.map(sel).map(flattenSingle);
                }
                else {
                    drawers = sel(drawer);
                }
                drawers
                    .filter((drawer) => {
                    return getDrawer(drawer) !== undefined;
                })
                    .map((drawer) => {
                    // Create observer
                    const observer = new MutationObserver((list, observer) => {
                        if (this.repo.get('actions').size > 0) {
                            this.repo.get('actions').forEach((action) => {
                                action(list, this.repo.get('mount').knob, observer);
                            });
                        }
                    });
                    // Start observer
                    observer.observe(drawer, {
                        attributes: true,
                        attributeFilter: [`data-states`, `hidden`],
                        attributeOldValue: true,
                        childList: false,
                        subtree: false,
                    });
                    // Store drawer and observer
                    this.repo.get('drawers').set(drawer, observer);
                    // Tell the Drawer that this Knob is attached
                    drawer.drawer.store.repo.get('knobs')
                        .set(this.repo.get('mount'), this.repo.get('mount').knob);
                    // Tell the knob we've added a drawer
                    this.repo.get('mount').dispatchEvent(new CustomEvent('knob.drawerAdded', {
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
            get: () => this.store.mount,
            set: (mount) => this.store.mount = mount,
        },
        state: {
            get: () => this.mount.dataset.state,
            set: (state) => {
                if (this.settings.states.indexOf(state) > -1) {
                    this.mount.dataset.state = state;
                }
            },
        },
        hidden: {
            get: () => this.mount.hidden,
            set: (hide) => this.mount.hidden = Boolean(hide),
        },
        hash: {
            get: () => this.settings.hash,
            set: (hash) => this.settings.hash = hash,
        },
        actions: {
            get: () => this.store.actions,
            set: (action) => this.store.actions = action,
        },
        knobs: {
            get: () => this.store.knobs,
            set: (knob) => this.store.knobs = knob
        },
        hasher: {
            value: {
                setUrl: () => ifValidHash(this.settings.hash, setHash),
                clearUrl: () => ifValidHash(this.settings.hash, clearHash),
                wipeUrl: wipeHash
            },
        },
        cycle: {
            value: (states) => cycle(this.mount, states),
        },
        detachKnob: {
            value: (knob) => {
                if (this.knobs.has(knob)) {
                    const event = new CustomEvent('drawer.knobRemoved', {
                        detail: {
                            drawer: this.mount,
                            knob: knob,
                        },
                    });
                    this.mount.dispatchEvent(event);
                    knob.dispatchEvent(event);
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
    this.mount.addEventListener(`knob.drawerRemoved`, handleRemovalEvent$1.bind(this));
    this.mount.addEventListener(`drawer.knobRemoved`, handleRemovalEvent$1.bind(this));
    const watcher = new MutationObserver((list, observer) => handleMutation.bind(this)(list, observer));
    this.observer = watcher.observe(this.mount, {
        attributes: true,
        attributeFilter: [`data-state`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });
    loadUserArguments$1.bind(this)(userArguments);
    // If there's a matching hash, set the hashState as the initState
    if (extractHash().length > 0) {
        const hash = extractHash();
        if (isValidHash(hash) && this.getHash() === hash && this.getHashState().length > 0) {
            this.settings.initState = this.getHashState();
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
    if (`drawer` in el) {
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
    this.actions.forEach((action) => action(list, this, observer));
}
/**
 * Handle removes of Knobs and Drawers from either type of element.
 * @param event
 */
function handleRemovalEvent$1(event) {
    const { detail: { knob }, type } = event;
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
    for (let i = 0; i < list.length; i++) {
        const { attributeName } = list[i];
        if (`data-state` === attributeName) {
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
    for (let i = 0; i < list.length; i++) {
        const { attributeName } = list[i];
        const { settings: { hashState }, state, hasher: { setUrl, clearUrl } } = api;
        if (`data-state` === attributeName) {
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
    const api = getDrawer(el);
    if (api) {
        const { settings: { states } } = api;
        const curIndex = states.indexOf(api.state);
        let nextState = states[curIndex + 1] || states[0];
        // If states have been passed, cycle only through those
        if (limitedStates) {
            const potentialCustomState = limitedStates[limitedStates.indexOf(api.state) + 1] || limitedStates[0];
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
    const allowedSettings = Object.keys(this.settings);
    const allowedStores = Object.keys(this.store);
    const collectedArguments = new Map();
    // Handle items described in element HTML
    const { dataset } = this.mount;
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
    const drawers = sel(selector || `[data-module="drawer"]`);
    if (drawers.length < 1) {
        return; // There are no drawers
    }
    return drawers.map((drawer) => new Drawer(drawer, userSettings));
}

export { Cabinet, Drawer, Knob, cycle, getDrawer, getKnob };
