import {isEl, sel} from "./util";
import {DrawerElement, KnobElement, KnobAction, KnobSettingsInterface, DrawerAPI, KnobAPI} from "./types";
import {KnobSettings} from "./settings";
import {KnobStore} from "./stores";

/**
 * This is a sort of intermediary function: Because `sel()` always returns
 * arrays, this handles dealing with each element of the array. The purpose of
 * this is that we want to be able to pass either a selector string or a literal
 * element when setting up a list of knobs and not have to think about it.
 * @param drawer
 * @param selector
 */
function setupKnobsBySelector(drawer: DrawerElement, selector: HTMLElement | string) {
    const array = sel(selector);

    if (array.length < 1) {
        return; // nothing to do
    }

    array.map((knob: HTMLElement) => setupSingleKnob(drawer, knob));
}

/**
 * Get the knob on an element.
 * @param el
 */
function getKnob(el: KnobElement): KnobAPI | undefined {
    if (el.hasOwnProperty(`knob`) && el.knob?.mount) {
        return el.knob;
    }
    return undefined;
}

/**
 * Create a new knob on an element.
 *
 * ** NOTE **
 * This will nicely handle trying to create a Knob when one already exists,
 * but it will *not* overwrite passed userSettings on an existing knob; they
 * will simply be discarded.
 * @param el
 * @param userSettings
 * @constructor
 */
function Knob(el: KnobElement, userSettings) {
    // Handle trying to create a new Knob when one already exists here
    if (getKnob(el)) {
        return getKnob(el);
    }

    // Now safely create a fresh Knob
    this.settings = new KnobSettings(userSettings);
    this.store = new KnobStore();

    // Proxy things in settings and stores to the Knob itself
    Object.defineProperties(this, {
        mount: {
            get: (): KnobElement => this.store.mount,
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
        accessibility: {
            get: () => this.settings.accessibility,
            set: (accessibility) => this.settings.accessibility = accessibility,
        },
        shouldCycle: {
            get: () => this.settings.cycle,
            set: (cycle) => this.settings.cycle = cycle,
        }
    });

    this.actions = handleAriaExpandedState.bind(this);

    this.mount.addEventListener('knob.drawerAdded', handleAddingDrawer.bind(this));
}

/**
 * Actions to be executed when a drawer is added to this Knob.
 * @param event
 */
function handleAddingDrawer(event) {
    const {drawer} = event.detail.drawer;
    const {api} = this.knob;

    knobSetAriaExpanded(api.mount, drawer);
    knobSetAriaControls(api.mount, drawer);
}

/**
 * Handle changing aria-expanded when the attached drawer is hidden
 * (or not).
 * @param list
 */
function handleAriaExpandedState(list) {
    for (let i = 0; i < list.length; i++) {
        const {target, attributeName} = list[i];
        if (`hidden` === attributeName) {
            knobSetAriaExpanded(this.mount, <DrawerElement>target);
        }
    }
}

/**
 * This attaches a single knob to the drawer bound to this function.
 * It's accessible on the drawer itself at `[drawer element].drawer.addKnob()`.
 * @param drawer
 * @param el
 */
function setupSingleKnob(drawer: DrawerElement, el: KnobElement) {
    // Need to namespace all our knob stuff
    if (!el.hasOwnProperty(`knob`)) {
        const {settings} = drawer.drawer;
        const knobSettings: KnobSettingsInterface = {
            doCycle: settings.knobsCycle,
            actions: settings.knobActions,
            accessibility: settings.knobAccessibility,
            drawers: new Map(),
        };
        el.knob = {
            settings: knobSettings,
            addAction: (action: KnobAction) => el.knob.settings.actions.push(action),
        };
    }

    const {settings: {drawers}, addAction} = el.knob;

    if (drawers.has(drawer)) {
        return; // A knob can only be attached to a drawer once
    }

    // Store a reference to the drawer and its observer
    drawers.set(drawer, new MutationObserver((list: Array<MutationRecord>, observer: MutationObserver) => knobObserverCallback(el, list, observer)));

    // Start observing
    drawers.get(drawer).observe(drawer, {
        attributes: true,
        attributeFilter: [`data-states`, `hidden`],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });

    // Set up all accessibility activity
    knobSetAriaExpanded(el, drawer);
    knobSetAriaControls(el, drawer);
    // Set up action to link aria-expanded state to drawer hidden state
    addAction((list: Array<MutationRecord>) => {
        for (let i = 0; i < list.length; i++) {
            const {target, attributeName} = list[i];
            if (`hidden` === attributeName) {
                knobSetAriaExpanded(el, <DrawerElement>target);
            }
        }
    });

    // Watch for clicks
    // `knobsCycle` checks on run in the handler to allow for dynamic
    // modifications.
    el.addEventListener(`click`, () => handleKnobClick(el));
}

/**
 * Handles setting the aria-expanded attribute on the knob bound to this
 * function.
 * @param el
 * @param drawer
 */
function knobSetAriaExpanded(el: KnobElement, drawer: DrawerElement) {
    if (el.knob.settings.accessibility) {
        el.setAttribute(`aria-expanded`, String(!drawer.hidden));
    }
}

function knobSetAriaControls(el: KnobElement, drawer: DrawerElement) {
    if (el.knob.settings.accessibility) {
        el.setAttribute(`aria-controls`, drawer.id);
    }
}

/**
 * This is called when the knob observes a mutation on a drawer it is
 * attached to.
 * @param el
 * @param mutationList
 * @param observer
 */
function knobObserverCallback(el: KnobElement, mutationList: Array<MutationRecord>, observer: MutationObserver) {
    const {actions} = el.knob.settings;
    if (actions.length > 0) {
        actions
            .map((action: KnobAction) => action(mutationList, el, observer));
    }
}

/**
 * Fired when the knob registers a click event.
 *
 * Only fires if `doCycle` is true. `doCycle` gets its
 * initial value from `knobsCycle` in the settings, but
 * can be independently set per knob (manually).
 */
function handleKnobClick(el: KnobElement) {
    const {doCycle, drawers} = el.knob.settings;
    if (doCycle) {
        drawers.forEach((observer: MutationObserver, drawer: DrawerElement) => {
            drawer.drawer.cycle();
        });
    }
}

export {setupKnobsBySelector, setupSingleKnob}
