import {flattenSingle, isEl, merge, sel, urlify, uuid} from "./util";
import {DrawerSettings} from "./settings";
import {DrawerElement, DrawerAPI, IngestedSettings, KnobElement, IDrawer} from "./types";
import {clearHash, extractHash, ifValidHash, isValidHash, setHash, wipeHash} from "./hash";
import {DrawerStore} from "./stores";

/**
 * Activate a drawer.
 * @param el
 * @param userSettings
 */
function Drawer(el: IDrawer.Element, userSettings?) {
    this.settings = ingestSettingsFromEl(el, new DrawerSettings(userSettings));
    this.store = new DrawerStore();

    Object.defineProperties(this, {
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
    this.mount = el;
    this.mount.drawer = this;

    // Ensure id
    if (!this.mount.id) {
        this.mount.id = this.settings.uuid ? this.settings.uuid() : uuid();
    }

    // DEBUG
    // add knob
    this.knobs = 'button';

    const watcher = new MutationObserver((list, observer) => handleMutation.bind(this)(list, observer));
    this.observer = watcher.observe(this.mount,{
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

function getDrawer(el: IDrawer.Element): IDrawer.API {
    if (el.hasOwnProperty(`drawer`) && el.drawer?.mount) {
        return el.drawer;
    }
    return undefined;
}

function handleMutation(list, observer) {
    this.actions.forEach(action => action(list, this, observer));
}

/**
 * Set up hidden behavior.
 * @param list
 * @param api
 */
function hiddenCallback(list: Array<MutationRecord>, api: IDrawer.API): void {
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
function hashCallback(list: Array<MutationRecord>, api: IDrawer.API): void {
    for (let i = 0; i < list.length; i++) {
        const {attributeName} = list[i];
        const { settings: { hashState }, state, hasher: { setUrl, clearUrl } } = api;
        if (`data-state` === attributeName) {
            if (state === hashState) {
                setUrl();
            } else {
                clearUrl();
            }
        }
    }
}

/**
 * Cycle through all available states, looping around at the end of the array.
 * If it is passed an array of states
 */
function cycle(el: IDrawer.Element, limitedStates?: Array<string>) {
    const {drawer, drawer: {settings: {states}}} = el;
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

export {Drawer, cycle, getState, setState, setHidden, getDrawer}
