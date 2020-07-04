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

const drawerDefaults = {
    /**
     * This is passed to `sel()` to find any possible drawers. Keep in mind that
     * it will then attach to *all* matches it finds.
     *
     * If items are added to the DOM after `setup()` has been run, you will need
     * to run it again: It does not watch for new items being added.
     */
    drawerSelector: `[data-module="drawer"]`,
    /**
     * This is a list of states the drawer can have. The names of the terms have
     * no internal meaning: They will be used to populated `data-state` and will
     * be matched against by `hiddenStates`, but they're essentially arbitrary.
     *
     * `cycle()` will move from the current state to the next state in this list,
     * and then start again from the first item when it reaches the end.
     */
    states: [
        `closed`,
        `opening`,
        `open`,
        `closing`,
    ],
    initState: undefined, // This will default to the first state in the states array.
    /**
     * These are states from the `states` array that are considered "closed".
     * Without other configuration, this means that when the drawer enters one
     * of these states, it will receive the `hidden` attribute, and ann attached
     * knobs will get `aria-expanded="false"`.
     *
     * To disable this behavior, just make this an empty array.
     */
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
        setState: state => el.dataset.state = state,
        setHidden: yes => el.hidden = yes,
        addKnob: setupKnobsFromSelector.bind(el),
        cycle: cycle.bind(el),
    };

    // Setting this up early so it will receive events dispatched in a few lines
    if (el.drawer.settings.knobs) {
        setupKnobs.bind(el)();
    }

    (new MutationObserver(drawerObserverCallback.bind(el))).observe(el, {
        attributes: true,
        attributeFilter: [`data-state`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });
}

function drawerObserverCallback(mutationList, observer) {
    for (let i = 0; i < mutationList.length; i++) {
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
        } = mutationList[i];
        if (`data-state` === attributeName) {
            setHidden(hiddenStates.indexOf(state) > -1);
        }
    }
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
            drawers: new Map(),
        };
    }

    const {drawers, setAction} = el.knob;

    if (drawers.has(this)) {
        return; // A knob can only be attached to a drawer once
    }

    // Store a reference to the drawer and it's observer
    drawers.set(this, new MutationObserver(knobObserverCallback.bind(el)));

    // Start observing
    drawers.get(this).observe(this, {
        attributes: true,
        attributeFilter: [`data-states`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });

    const knobSetAriaExpandedBound = knobSetAriaExpanded.bind(el);

    // Check when set set up to make them match
    knobSetAriaExpandedBound(this);

    // Set up action to link aria-expanded state to drawer hidden state
    setAction((list, knob, observer) => {
        for (let i = 0; i < list.length; i++) {
            const {target, attributeName} = list[i];
            if (`hidden` === attributeName) {
                knobSetAriaExpandedBound(target);
            }
        }
    });

    el.addEventListener(`click`, handleKnobClick.bind(el));
}

function knobSetAriaExpanded(drawer) {
    this.setAttribute(`aria-expanded`, !drawer.hidden);
}

function knobObserverCallback(mutationList, observer) {
    const {actions} = this.knob;
    if (actions.length > 0) {
        actions
            .map(action => action(mutationList, this, observer));
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
        drawers.forEach((observer, drawer) => {
            drawer.drawer.cycle();
        });
    }
}

/**
 * Cycle through all available states, looping around at the end of the array.
 * If it is passed an array of states
 */
function cycle(states) {
    const {settings, getState, setState} = this.drawer;
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
 * DEBUG / DEV
 *
 * @todo Remove this before launch, obviously.
 */
setup();
setup({drawerSelector: `[data-module="drawer2"]`});
