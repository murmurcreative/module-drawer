import {isValidHash} from "./hash";
import {flattenSingle, sel, urlify} from "./util";
import isCallable from "is-callable";

/**
 * This will append items to a settings item that is an array.
 *
 * Bind it to your settings object and you're off to the races.
 * @param name
 * @param row
 */
function append(name, row) {
    if (!this.store.has(name)) {
        this.store.set(name, [row]);
    } else {
        let current = this.store.get(name);
        current.push(row);
        this.store.set(name, current);
    }
}

function DrawerSettings(userSettings) {
    /**
     * This is where settings are kept internally.
     */
    this.store = new Map();

    this.append = (name, row) => append.bind(this);

    this.inStates = (state: string) => {
        return this.store.get('states').indexOf(state) > -1;
    };

    /**
     * Set some defaults.
     */
    drawerDefaults()
        .map(row => {
            const [name, value] = row;
            this.store.set(name, value);
        });

    const {append, inStates, store} = this;


    Object.defineProperties(this, {
        states: {
            get: () => store.get('states') || [],
            set: (arg: string | Array<string>) => {
                if (typeof arg === 'string') {
                    append('states', arg);
                } else if (Array.isArray(arg)) {
                    store.set('states', arg);
                }
            }
        },
        initState: {
            get: () => store.get('initState') || store.get('states')[0],
            set: (arg) => {
                if (typeof arg === 'string' && inStates(arg)) {
                    store.set('initState', arg);
                } else {
                    store.set('initState', false);
                }
            }
        },
        hiddenStates: {
            get: () => store.get('hiddenStates') || [],
            set: (arg) => {
                if (typeof arg === 'string' && inStates(arg)) {
                    append('hiddenStates', arg);
                } else if (Array.isArray(arg)) {
                    const validHiddenStates = arg.filter(state => inStates(state));
                    store.set('hiddenStates', validHiddenStates);
                }
            }
        },
        hash: {
            get: () => store.get('hash') || '',
            set: (arg) => {
                if (isValidHash(arg)) {
                    store.set('hash', urlify(arg));
                }
            }
        },
        hashState: {
            get: () => {
                if (!store.get('hashState')) {
                    const nonHiddenStates = store.get('states').filter(x => !store.get('hiddenStates').includes(x));
                    return nonHiddenStates[0] || '';
                }
                return store.get('hashState');
            },
            set: (arg) => {
                if (typeof arg === 'string' && inStates(arg) && store.get('hiddenState').indexOf(arg) < 0) {
                    store.set('hashState', arg);
                }
            }
        },
        actions: {
            get: () => store.get('actions') || [],
            set: (arg) => {
                if (isCallable(arg)) {
                    append('actions', arg);
                }
            }
        },
        uuid: {
            get: () => store.get('uuid') || undefined,
            set: (arg) => {
                if (isCallable(arg)) {
                    store.set('uuid', arg);
                } else {
                    store.set('uuid', undefined);
                }
            }
        },
        knobs: {
            get: () => store.get('knobs') || [],
            set: (arg) => {
                if (Array.isArray(arg)) {
                    store.set('knobs', flattenSingle(arg.map(sel)));
                } else {
                    sel(arg).map(el => append('knobs', el));
                }
            }
        },
        knobsCycle: {
            get: () => store.get('knobsCycle') || true,
            set: (arg) => store.set('knobsCycle', Boolean(arg))
        },
        knobActions: {
            get: () => store.get('knobActions') || [],
            set: (arg) => {
                if (isCallable(arg)) {
                    append('knobActions', arg);
                } else if (Array.isArray(arg)) {
                    store.set('knobActions', arg.filter(isCallable));
                }
            }
        },
        knobAccessibility: {
            get: () => store.get('knobAccessibility') || [],
            set: (arg) => Boolean(arg)
        }
    });

    /**
     * Apply any user settings
     */
    if (typeof userSettings === 'object') {
        for (const prop in userSettings) {
            if (this.hasOwnProperty(prop)) {
                this[prop] = userSettings[prop];
            }
        }
    }
}

function KnobSettings(userSettings) {
    /**
     * This is where settings are kept internally.
     */
    this.store = new Map();

    this.append = (name, row) => append.bind(this);

    const {store, append} = this;

    Object.defineProperties(this, {
        cycle: {
            get: () => store.get('cycle'),
            set: (arg) => store.set(Boolean(arg))
        },
        actions: {
            get: () => store.get('actions') || [],
            set: (arg) => {
                if (isCallable(arg)) {
                    append('actions', arg);
                }
            }
        },
        accessibility: {
            get: () => store.get('actions') || true,
            set: (arg) => store.set('actions', Boolean(arg))
        },
        drawers: {
            get: () => store.get('drawers') || new Map(),
            set: (arg) => {
                let drawers = [];
                if (Array.isArray(arg)) {
                    drawers = arg.map(sel).map(flattenSingle);
                } else {
                    drawers = sel(arg);
                }
                drawers.map(drawer => {
                    let observer = new MutationObserver((list, observer) => {
                        store.get('actions').map(action => {
                            action(list, )
                        });
                    });
                    store('drawers').set(drawer, )
                })
            }
        },
    });

    /**
     * Apply any user settings
     */
    if (typeof userSettings === 'object') {
        for (const prop in userSettings) {
            if (this.hasOwnProperty(prop)) {
                this[prop] = userSettings[prop];
            }
        }
    }
}

function drawerDefaults() {
    return [
        /**
         * This is a list of states the drawer can have. The names of the terms have
         * no internal meaning: They will be used to populated `data-state` and will
         * be matched against by `hiddenStates`, but they're essentially arbitrary.
         *
         * `cycle()` will move from the current state to the next state in this list,
         * and then start again from the first item when it reaches the end.
         */
        ['states', [
            `closed`,
            `open`,
        ]],
        ['initState', undefined], // This will default to the first state in the states array.
        /**
         * These are states from the `states` array that are considered "closed".
         * Without other configuration, this means that when the drawer enters one
         * of these states, it will receive the `hidden` attribute, and ann attached
         * knobs will get `aria-expanded="false"`.
         *
         * To disable this behavior, just make this an empty array.
         */
        ['hiddenStates', [
            `closed`,
        ]],
        /**
         * The hash will be appended to the URL when the Drawer is in the state
         * described in hashState. If hash is not a string with a length greater
         * than one, all hash functionality is disabled. If hash is valid, but
         * hashState is not, then the de facto hash-state will be the first non-
         * hidden state found in states.
         */
        ['hash', ''],
        /**
         * When this state is active on the drawer, the hash will be added to the
         * url, and this state will be activated if the hash is in the URL. If
         * this is set but hash is not valid, nothing will happen.
         */
        ['hashState', ''],
        /**
         * Functions to be run when the drawer observes a change it its
         * state or hidden attribute.
         */
        ['actions', []],
        /**
         * If you need better uuids, pass a callback to this function that
         * generates them.
         */
        ['uuid', undefined],
        /**
         * List of knobs to activate.
         *
         * We don't define any default knob selectors because it
         * would be very confusing behavior. Knobs are strictly
         * opt-in.
         */
        ['knobs', []],
        /**
         * Whether or not clicking on a knob fires the `cycle()` method
         * on any attached drawer(s).
         *
         * If you want more complex behavior for your knobs (or your knobs
         * won't be dispatching the `click` event on activation) then set
         * this to false.
         *
         * Has no effect if there are no attached knobs.
         */
        ['knobsCycle', true],
        /**
         * An array of functions that will be called when knobs handle the
         * knobState event. Each function will be passed the event as the
         * first argument, and the current knob as the second.
         */
        ['knobActions', []],
        /**
         * Whether or not to enable accessibility features on knobs.
         * Generally this should be true, but for some knob use cases
         * (i.e. non-interactive knobs) accessibility features may be
         * unnecessary or problematic.
         */
        ['knobAccessibility', true],
    ];
}

export {drawerDefaults, DrawerSettings, KnobSettings}
