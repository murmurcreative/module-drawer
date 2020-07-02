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
 * Currently just a wrapper for Object.assign, but abstracted in case this
 * logic needs to become more detail (i.e. a deeper merge).
 * @param target
 * @param defaults
 * @returns {*}
 */
const merge = (target, defaults) => {
    return Object.assign(target, defaults);
};

/**
 * Create a custom event describing a state transition.
 * @param from
 * @param to
 * @returns {CustomEvent<{from: *, to: *}>}
 */
const makeEvent = (from, to) => {
    return new CustomEvent(`drawerState`, {
        detail: {
            from: from,
            to: to,
        },
        bubbles: true,
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
    ]
};

/**
 * Set up all drawers we can find.
 * @param object
 */
function setup(object) {
    const userSettings = object || {};
    const settings = merge(userSettings, drawerDefaults);
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
        setState: setState.bind(el),
        setHidden: setHidden.bind(el),
        cycle: cycle.bind(el),
    };

    // Set initial state
    el.drawer.setState(settings.initState);

    // Set hidden if in a hidden state
    el.addEventListener(`drawerState`, e => {
        // Only hide the drawer dispatching the event
        if (e.target === el) {
            el.drawer.setHidden(settings.hiddenStates.indexOf(e.detail.to) > -1)
        }
    });
}

/**
 * Cycle through all available states, looping around at the end of the array.
 */
function cycle() {
    const cur = this.drawer.getState();
    const curIndex = this.drawer.settings.states.indexOf(cur);

    this.drawer.setState(this.drawer.settings.states[curIndex + 1] || this.drawer.settings.states[0]);
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
    if (el.dataset.state) ingested.initState = el.dataset.state;
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
 * Set the state (i.e. open or closed).
 *
 * @todo I'm not pleased that this has the side effect of dispatching an event. Consider dispatching the event *only* and having a listener that actually sets state? But then you aren't setting state, you're firing an event, which is semantically confusing... Maybe change to "requestStateChange()" or something so semantics make more sense.
 * @param state
 * @returns {*}
 */
function setState(state) {
    const ev = makeEvent(this.dataset.state, state);
    this.dataset.state = state;
    this.dispatchEvent(ev);
    return this.drawer.getState();
}

/**
 * Set the hidden property, primarily for accessibility reasons.
 * @param yes
 */
function setHidden(yes) {
    this.hidden = yes;
}

/**
 * DEBUG / DEV
 *
 * @todo Remove this before launch, obviously.
 */
setup();

