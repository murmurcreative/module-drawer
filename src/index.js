/**
 * Is this an element?
 * @param el
 * @returns {boolean}
 */
const isEl = el => el instanceof Element || el instanceof HTMLDocument;

/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {array}
 */
const sel = el => (typeof el === `string`)
    ? Array.from(document.querySelectorAll(el))
    : isEl(el) ? [el] : [];

/**
 * Merges two objects.
 *
 * Different from Object.assign in that it does not modify the `target`
 * object; it creates a copy on the fly.
 *
 * Currently just a wrapper for Object.assign, but abstracted in case this
 * logic needs to become more detail (i.e. a deeper merge).
 * @param target
 * @param defaults
 * @returns {*}
 */
const merge = (target, defaults) => {
    return Object.assign(Object.assign({}, target), defaults);
};

/**
 * Create a custom event describing a state transition.
 * @param from
 * @param to
 * @returns {CustomEvent<{from: *, to: *}>}
 */
const makeStateEvent = (from, to) => {
    return new CustomEvent(`drawerState`, {
        detail: {
            from: from,
            to: to,
        },
        bubbles: true,
    })
};

/**
 * Create a custom event describing the change of the hidden attribute.
 * @param from
 * @param to
 * @returns {CustomEvent<{from: *, to: *}>}
 */
const makeHiddenEvent = (from, to) => {
    return new CustomEvent(`drawerHidden`, {
        detail: {
            from: from,
            to: to,
        },
        bubbles: true,
    })
};

/**
 * Create a custom event for a knob to mirror its drawer.
 * @param from
 * @param to
 * @returns {CustomEvent<{from: *, to: *}>}
 */
const makeKnobStateEvent = (from, to) => {
    return new CustomEvent(`knobState`, {
        detail: {
            from: from,
            to: to,
        },
        bubbles: false,
    })
};

const drawerDefaults = {
    drawerSelector: `[data-module="drawer"]`,
    states: [
        `closed`,
        `opening`,
        `open`,
        `closing`,
    ],
    initState: undefined, // This will default to the first state in the states array.
    hiddenStates: [
        `closed`,
    ],
    /**
     * List of knobs to activate.
     *
     * We don't define any default knob selectors because it
     * would be very confusing behavior. Knobs are strictly
     * opt-in.
     */
    knobs: [],
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
    knobsCycle: true,
    /**
     * An array of functions that will be called when knobs handle the
     * knobState event. Each function will be passed the event as the
     * first argument, and the current knob as the second.
     */
    knobActions: [],
};

/**
 * Set up all drawers we can find.
 * @param object
 */
function setup(object) {
    const userSettings = object || {};
    const settings = merge(drawerDefaults, userSettings);
    const drawers = sel(settings.drawerSelector);
    if (drawers.length < 1) {
        return; // There are no drawers
    }

    drawers.map(drawer => activateDrawer(drawer, settings));
}

/**
 * Activate a drawer.
 * @param el
 * @param settings
 */
function activateDrawer(el, settings) {
    if (!isEl(el)) {
        return; // Do nothing if called on non-element
    }

    // Compute initState
    if (undefined === settings.initState || settings.states.indexOf(settings.initState) < 0) {
        settings.initState = settings.states[0];
    }

    el.drawer = {
        settings: ingestSettingsFromEl(el, settings),
        getState: getState.bind(el),
        setState: requestStateChange.bind(el),
        setHidden: requestHiddenChange.bind(el),
        addKnob: setupKnobsFromSelector.bind(el),
        cycle: cycle.bind(el),
    };

    // Setting this up early so it will receive events dispatched in a few lines
    if (el.drawer.settings.knobs) {
        setupKnobs.bind(el)();
    }

    // Handle all drawerState events.
    el.addEventListener(`drawerState`, handleDrawerState.bind(el));

    // Handle all drawerHidden events.
    el.addEventListener(`drawerHidden`, handleDrawerHidden.bind(el));

    // Set initial state
    el.drawer.setState(el.drawer.settings.initState);

}

function setupKnobs() {
    const {knobs} = this.drawer.settings;
    const {addKnob} = this.drawer;

    if (undefined === knobs || knobs.length < 1) {
        return;
    }

    knobs
        .map(sel)   // This allows describing knobs as elements *or* selector strings
        .flat()     // sel returns arrays of items, so flatten everything
        .map(addKnob);
}

function setupKnobsFromSelector(selector) {
    const array = sel(selector);

    if (array.length < 1) {
        return; // nothing to do
    }

    array.map(setupSingleKnob.bind(this));
}

function setupSingleKnob(el) {
    // Need to namespace all our knob stuff
    if (!el.hasOwnProperty(`knob`)) {
        const {settings} = this.drawer;
        el.knob = {
            doCycle: settings.knobsCycle,
            actions: settings.knobActions,
            setAction: action => el.knob.actions.push(action),
            drawers: [],
        };
    }

    if (el.knob.drawers.indexOf(this) > -1) {
        return; // A knob can only be attached to a drawer once
    }

    el.knob.setAction((e, knob) => {
        knob.setAttribute(`aria-expanded`, e.detail.to === `open`);
    });

    // Tell the drawer to dispatch events to this knob
    this.addEventListener(`drawerState`, e => el.dispatchEvent(makeKnobStateEvent(e.detail.from, e.detail.to)));

    // Tell the knob to listen for events from itself
    el.addEventListener(`knobState`, handleKnobState.bind(el));
    el.addEventListener(`click`, handleKnobClick.bind(el));

    // Store a reference to the drawer
    el.knob.drawers.push(this);
}

function handleKnobState(e) {
    const {actions} = this.knob;
    if (actions.length > 0) {
        actions
            .map(action => action(e, this));
    }
}

/**
 * Fired when the knob registers a click event.
 *
 * Only fires if `doCycle` is true. `doCycle` gets its
 * initial value from `knobsCycle` in the settings, but
 * can be independently set per knob (manually).
 */
function handleKnobClick() {
    const {doCycle, drawers} = this.knob;
    if (doCycle) {
        drawers.map(d => d.drawer.cycle());
    }
}

/**
 * Handle all drawerState events.
 * @param e
 */
function handleDrawerState(e) {
    if (e.target !== this) {
        return; // Ignore all other drawers
    }

    const {settings, setHidden} = this.drawer;

    // Set the state
    this.dataset.state = e.detail.to;

    // Set [hidden] if necessary
    setHidden(settings.hiddenStates.indexOf(e.detail.to) > -1)
}

/**
 * Handle all drawerHidden events.
 * @param e
 */
function handleDrawerHidden(e) {
    if (e.target !== this) {
        return; // Ignore all other drawers
    }

    this.hidden = Boolean(e.detail.to);
}

/**
 * Cycle through all available states, looping around at the end of the array.
 * If there are only two states, this functions like a toggle.
 */
function cycle() {
    const {settings, getState, setState} = this.drawer;
    const curIndex = settings.states.indexOf(getState());

    setState(settings.states[curIndex + 1] || settings.states[0]);
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
    let ingested = {};
    // data-state="initial state"
    if (el.dataset.state) ingested.initState = el.dataset.state;

    // data-knob="knob selector"
    if (el.dataset.knob) ingested.knobs = [el.dataset.knob];

    return merge(settings, ingested);
}

/**
 * Get the state (i.e. open or closed).
 * @returns {string}
 */
function getState() {
    return this.dataset.state;
}

/**
 * Dispatch event that causes state change.
 * @param state
 */
function requestStateChange(state) {
    const {getState} = this.drawer;
    const ev = makeStateEvent(getState(), state);
    this.dispatchEvent(ev);
}

/**
 * Dispatch event that causes hidden attribute change.
 * @param yes
 */
function requestHiddenChange(yes) {
    const ev = makeHiddenEvent(Boolean(this.hidden), yes);
    this.dispatchEvent(ev);
}

/**
 * DEBUG / DEV
 *
 * @todo Remove this before launch, obviously.
 */
setup();
setup({drawerSelector: `[data-module="drawer2"]`});
