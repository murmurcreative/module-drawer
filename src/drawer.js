import {isEl, merge, sel} from "./util";
import drawerDefaults from "./settings";
import {setupKnobsBySelector} from "./knob";

/**
 * Activate a drawer.
 * @param el
 * @param userSettings
 */
function Drawer(el, userSettings) {
    if (!isEl(el)) {
        return; // Do nothing if called on non-element
    }

    if (undefined === userSettings) {
        userSettings = drawerDefaults();
    }

    // Compute initState
    if (undefined === userSettings.initState || userSettings.states.indexOf(userSettings.initState) < 0) {
        userSettings.initState = userSettings.states[0];
    }

    Object.assign(this, {
        settings: ingestSettingsFromEl(el, userSettings),
        getState: () => getState(el),
        setState: state => setState(el, state),
        setHidden: hide => setHidden(el, hide),
        addKnob: knob => setupKnobsBySelector(el, knob),
        addAction: action => el.drawer.settings.actions.push(action),
        cycle: states => cycle(el, states),
    });

    // Since this is called with the `new` keyword, `this` is a fresh object,
    // which we want to store on the element at the API endpoint.
    el.drawer = this;

    // Set up any knobs we're aware of
    const {addKnob, settings: {knobs}} = el.drawer;
    if (knobs) {
        knobs
            .map(sel)   // This allows describing knobs as elements *or* selector strings
            .flat()     // sel returns arrays of items, so flatten everything
            .map(addKnob);
    }

    // Couple state to hidden attribute
    const {addAction} = el.drawer;
    addAction(list => {
        for (let i = 0; i < list.length; i++) {
            const {
                attributeName,
                target: {
                    drawer: {
                        settings: {
                            hiddenStates
                        },
                        setHidden
                    },
                    dataset: {
                        state
                    }
                }
            } = list[i];

            if (`data-state` === attributeName) {
                setHidden(hiddenStates.indexOf(state) > -1);
            }
        }
    });

    // Start observing this drawer
    (new MutationObserver((list, observer) => drawerObserverCallback(el, list, observer))).observe(el, {
        attributes: true,
        attributeFilter: [`data-state`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });
}

/**
 * Called whenever the drawer observes a mutation change.
 * @param el
 * @param list
 * @param observer
 */
function drawerObserverCallback(el, list, observer) {
    const {settings: {actions}} = el.drawer;
    for (let i = 0; i < actions.length; i++) {
        actions[i](list, el, observer);
    }
}

/**
 * Cycle through all available states, looping around at the end of the array.
 * If it is passed an array of states
 */
function cycle(el, states) {
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
function ingestSettingsFromEl(el, settings) {
    const {state, knob} = el.dataset;
    let ingested = {};

    // data-state="initial state"
    if (state && settings.states.indexOf(state) > -1) ingested.initState = state;

    // data-knob="knob selector"
    if (knob) ingested.knobs = [knob];

    return merge(settings, ingested);
}

/**
 * Get the state (i.e. open or closed).
 * @returns {string}
 */
function getState(el) {
    return el.dataset.state;
}

/**
 * Set the state on an element.
 * @param el
 * @param state
 */
function setState(el, state) {
    el.dataset.state = state;
}

/**
 * Set the hidden attribute on an element.
 * @param el
 * @param hide
 */
function setHidden(el, hide) {
    el.hidden = hide;
}

export {Drawer, cycle, getState, setState, setHidden}
