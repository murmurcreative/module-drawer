import {flattenSingle, isEl, merge, sel, urlify, uuid} from "./util";
import {DrawerSettings} from "./settings";
import {setupKnobsBySelector} from "./knob";
import {DrawerElement, DrawerAPI, IngestedSettings} from "./types";
import {clearHash, extractHash, ifValidHash, isValidHash, setHash, wipeHash} from "./hash";

/**
 * Activate a drawer.
 * @param el
 * @param userSettings
 */
function Drawer(el: DrawerElement, userSettings?) {
    this.settings = ingestSettingsFromEl(el, new DrawerSettings(userSettings));

    Object.defineProperties(this, {
        // Once a drawer is mounted, you can change that
        mount: {
            get: () => isEl(el) ? el : undefined,
            set: undefined,
        },
        state: {
            get: () => getState(el),
            set: (state) => setState(el, state),
        },
        hidden: {
            get: () => el.hidden,
            set: (hide) => setHidden(el, hide),
        },
        hash: {
            get: () => this.settings.hash,
            set: (hash) => this.settings.hash = hash,
        },
        actions: {
            get: () => this.settings.actions,
            set: (action) => this.settings.actions = action,
        },
        knobs: {
            get: () => this.settings.knobs,
            set: (knob) => this.settings.knobs = knob
        },

    });

    // Functions for hash handling
    this.hasher = {
        setUrl: () => ifValidHash(this.settings.hash, setHash),
        clearUrl: () => ifValidHash(this.settings.hash, clearHash),
        wipeUrl: wipeHash
    };

    // Add function for moving through states
    this.cycle = (states: Array<string>) => cycle(el, states);

    // Couple state to hidden attribute
    this.actions = hiddenCallback;

    // Set up hash actions
    this.actions = hashCallback;

    // Attach the API to the element
    initializeElement(el, this);

    // Attach all Knobs
    initializeKnobs(this);

    // Start observing this drawer
    (new MutationObserver((list: Array<MutationRecord>, observer: MutationObserver) => drawerObserverCallback(el, list, observer))).observe(el, {
        attributes: true,
        attributeFilter: [`data-state`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });

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

function initializeKnobs(api) {
    if (api.settings.knobs.length > 0) {
        console.log(api.settings.knobs);
        api.settings.knobs.map(knob => api.knobs = knob);
    }
}

function initializeElement(el, api) {
    // Place the API on the element
    el.drawer = api;

    if (!el.id) {
        el.id = api.settings.uuid ? this.settings.uuid() : uuid();
    }
}

/**
 * Set up hidden behavior.
 * @param list
 */
function hiddenCallback(list): void {
    for (let i = 0; i < list.length; i++) {
        const {
            attributeName,
            target,
        } = list[i];

        const {
            drawer,
            drawer: {
                settings: {
                    hiddenStates
                }
            }
        } = <DrawerElement>target;

        if (`data-state` === attributeName) {
            drawer.hidden = hiddenStates.indexOf(drawer.state) > -1;
        }
    }
}

/**
 * Set up hash behavior.
 * @param list
 */
function hashCallback(list: Array<MutationRecord>): void {
    for (let i = 0; i < list.length; i++) {
        const {attributeName, target} = list[i];
        const {drawer, drawer: {hasher: {setUrl, clearUrl}, settings: {hashState}}} = <DrawerElement>target;
        if (`data-state` === attributeName) {
            if (drawer.state === hashState) {
                setUrl();
            } else {
                clearUrl();
            }
        }
    }
}

/**
 * Called whenever the drawer observes a mutation change.
 * @param el
 * @param list
 * @param observer
 */
function drawerObserverCallback(el: DrawerElement, list: Array<MutationRecord>, observer: MutationObserver) {
    const {settings: {actions}} = el.drawer;
    for (let i = 0; i < actions.length; i++) {
        actions[i](list, el, observer);
    }
}

/**
 * Cycle through all available states, looping around at the end of the array.
 * If it is passed an array of states
 */
function cycle(el: DrawerElement, limitedStates?: Array<string>) {
    const {drawer, drawer: { settings: { states }}} = el;
    const curIndex = states.indexOf(drawer.state);
    let nextState = states[curIndex + 1] || states[0];

    // If states have been passed, cycle only through those
    if (limitedStates) {
        const potentialCustomState = limitedStates[limitedStates.indexOf(drawer.state) + 1] || limitedStates[0];
        // Only allow valid states
        if (states.indexOf(potentialCustomState) > -1) {
            nextState = potentialCustomState;
        }
    }

    drawer.state = nextState;
}

/**
 * Pull any relevant settings from the drawer HTML.
 *
 * These will override all other settings.
 * @param el
 * @param settings
 * @returns {*}
 */
function ingestSettingsFromEl(el: HTMLElement, settings) {
    const {state, knob, hash, hashState} = el.dataset;

    // data-state="initial state"
    if (state
        && settings.states.indexOf(state) > -1 // is valid state
    ) settings.initState = state;

    // data-knob="knob selector"
    if (knob) settings.knobs = knob;

    // data-hash="hash-string"
    if (hash !== undefined) settings.hash = hash;

    // data-hashState="state"
    if (hashState
        && settings.states.indexOf(hashState) > -1 // is valid state
        && settings.hiddenStates.indexOf(hashState) < 0 // is not a hidden state
    ) this.hashState = hashState;

    return settings;
}

/**
 * Get the state (i.e. open or closed).
 * @returns {string}
 */
function getState(el: DrawerElement) {
    return el.dataset.state;
}

/**
 * Set the state on an element.
 * @param el
 * @param state
 */
function setState(el: DrawerElement, state: string) {
    if (el.dataset.state !== state) {
        el.dataset.state = state;
    }
}

/**
 * Set the hidden attribute on an element.
 * @param el
 * @param hide
 */
function setHidden(el: DrawerElement, hide: boolean) {
    el.hidden = hide;
}

export {Drawer, cycle, getState, setState, setHidden}
