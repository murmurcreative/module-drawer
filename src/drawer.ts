import {resolveLoadArguments, uuid} from "./util";
import {DrawerSettings} from "./settings";
import {IActions, IDrawer, IKnob} from "./types";
import {clearHash, extractHash, ifValidHash, isValidHash, setHash, wipeHash} from "./hash";
import {DrawerStore} from "./stores";

/**
 * Activate a drawer.
 * @param el
 * @param userArguments
 */
function Drawer(el: HTMLElement, userArguments?: IDrawer.Settings | object | undefined) {
    /** ==== Initialize the API ==== */
    this.settings = new DrawerSettings();
    this.store = new DrawerStore();

    Object.defineProperties(this, {
        mount: {
            get: () => this.store.mount,
            set: (mount: IDrawer.Element) => this.store.mount = mount,
        },
        state: {
            get: (): string => this.mount.dataset.state,
            set: (state: string) => {
                if (this.settings.states.indexOf(state) > -1) {
                    this.mount.dataset.state = state;
                }
            },
        },
        hidden: {
            get: (): boolean => this.mount.hidden,
            set: (hide: boolean) => this.mount.hidden = Boolean(hide),
        },
        hash: {
            get: (): string => this.settings.hash,
            set: (hash: string) => this.settings.hash = hash,
        },
        actions: {
            get: (): Map<string, IActions.Observe> => this.store.actions,
            set: (action: IActions.Observe) => this.store.actions = action,
        },
        knobs: {
            get: (): Map<IKnob.Element, IKnob.API> => this.store.knobs,
            set: (knob: string | HTMLElement | Array<HTMLElement | string>) => this.store.knobs = knob
        },
    });

    // Functions for hash handling
    this.hasher = {
        setUrl: () => ifValidHash(this.settings.hash, setHash),
        clearUrl: () => ifValidHash(this.settings.hash, clearHash),
        wipeUrl: wipeHash
    };

    // Add function for moving through states
    this.cycle = (states: Array<string>) => cycle(this.mount, states);

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

    /** ==== Load settings and stores ==== */
    loadUserArguments.bind(this)(userArguments);

    const watcher = new MutationObserver((list: Array<MutationRecord>, observer: MutationObserver) => handleMutation.bind(this)(list, observer));
    this.observer = watcher.observe(this.mount, {
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

/**
 * Get the API if it exists.
 * Also useful for determining if an element has a drawer attached or not.
 * @param el
 */
function getDrawer(el: HTMLElement | IDrawer.Element): IDrawer.API | undefined {
    if (`drawer` in el) {
        return el.drawer;
    } else {
        return undefined;
    }
}

function handleMutation(list: Array<MutationRecord>, observer: MutationObserver) {
    this.actions.forEach((action: IActions.Observe) => action(list, this, observer));
}

/**
 * Set up hidden behavior.
 * @param list
 * @param api
 */
function hiddenCallback(list: Array<MutationRecord>, api: IDrawer.API): void {
    for (let i = 0; i < list.length; i++) {
        const {attributeName} = list[i];

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
        const {settings: {hashState}, state, hasher: {setUrl, clearUrl}} = api;
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
    const api = getDrawer(el);
    if (api) {
        const {settings: {states}} = api;
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
function loadUserArguments(userArguments: IDrawer.Settings) {
    const allowedSettings = Object.keys(this.settings);
    const allowedStores = Object.keys(this.store);
    const collectedArguments = new Map();

    // Handle items described in element HTML
    const {dataset} = this.mount;
    if (dataset.state) collectedArguments.set('initState', dataset.state);
    if (dataset.knob) collectedArguments.set('knobs', dataset.knob);
    if (dataset.hash) collectedArguments.set('hash', dataset.hash);
    if (dataset.hashState) collectedArguments.set('hashState', dataset.hashState);

    resolveLoadArguments.bind(this)(userArguments, collectedArguments, allowedSettings, allowedStores);
}

export {Drawer, getDrawer, cycle}
