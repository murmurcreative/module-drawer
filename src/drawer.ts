import {flattenSingle, isEl, merge, sel, uuid} from "./util";
import {defaults} from "./settings";
import {setupKnobsBySelector} from "./knob";
import {DrawerElement, DrawerAPI, IngestedSettings, Settings} from "./types";

/**
 * Activate a drawer.
 * @param el
 * @param userSettings
 */
function Drawer(el: DrawerElement, userSettings?: Settings): DrawerAPI {
    if (!isEl(el)) {
        this.real = false;
        return; // Do nothing if called on non-element
    }

    const settings = defaults(userSettings);

    // Compute initState
    if (undefined === settings.initState || settings.states.indexOf(settings.initState) < 0) {
        settings.initState = settings.states[0];
    }

    // Set up uuid
    settings.uuid = undefined === settings.uuid
        ? uuid
        : settings.uuid;
    const api = <DrawerAPI>{
        real: true,
        settings: ingestSettingsFromEl(el, settings),
        getState: () => getState(el),
        setState: state => setState(el, state),
        setHidden: hide => setHidden(el, hide),
        addKnob: knob => setupKnobsBySelector(el, knob),
        addAction: action => el.drawer.settings.actions.push(action),
        cycle: states => cycle(el, states),
    };

    // Build our API object
    Object.assign(this, api);

    // Since this is called with the `new` keyword, `this` is a fresh object,
    // which we want to store on the element at the API endpoint.
    el.drawer = this;

    if (!el.id) {
        el.id = el.drawer.settings.uuid();
    }

    // Set up any knobs we're aware of
    const {addKnob, settings: {knobs}} = el.drawer;
    if (knobs) {
        flattenSingle(knobs.map(sel))
            .map(addKnob);
    }

    // Couple state to hidden attribute
    const {addAction} = el.drawer;
    addAction((list: Array<MutationRecord>) => {
        for (let i = 0; i < list.length; i++) {
            const {
                attributeName,
                target,
            } = list[i];

            const {
                drawer: {
                    settings: {
                        hiddenStates
                    },
                    setHidden
                },
                dataset: {
                    state
                }
            } = <DrawerElement>target;

            if (`data-state` === attributeName) {
                setHidden(hiddenStates.indexOf(state) > -1);
            }
        }
    });

    // Start observing this drawer
    (new MutationObserver((list: Array<MutationRecord>, observer: MutationObserver) => drawerObserverCallback(el, list, observer))).observe(el, {
        attributes: true,
        attributeFilter: [`data-state`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });

    // Set the initial state, if it differs from the current one
    if (this.settings.initState !== api.getState()) {
        api.setState(this.settings.initState);
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
function cycle(el: DrawerElement, states?: Array<string>) {
    const {settings, getState, setState} = el.drawer;
    const curIndex = settings.states.indexOf(getState());
    let nextState = settings.states[curIndex + 1] || settings.states[0];

    // If states have been passed, cycle only through those
    if (states) {
        const potentialCustomState = states[states.indexOf(getState()) + 1] || states[0];
        // Only allow valid states
        if (settings.states.indexOf(potentialCustomState) > -1) {
            nextState = potentialCustomState;
        }
    }

    setState(nextState);
}

/**
 * Pull any relevant settings from the drawer HTML.
 *
 * These will override all other settings.
 * @param el
 * @param settings
 * @returns {*}
 */
function ingestSettingsFromEl(el: HTMLElement, settings: Settings) {
    const {state, knob} = el.dataset;
    let ingested: IngestedSettings = {};

    // data-state="initial state"
    if (state && settings.states.indexOf(state) > -1) ingested['initState'] = state;

    // data-knob="knob selector"
    if (knob) ingested['knobs'] = [knob];

    return merge(settings, ingested);
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
    el.dataset.state = state;
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
