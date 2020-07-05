import {sel} from "./util";

/**
 * This is a sort of intermediary function: Because `sel()` always returns
 * arrays, this handles dealing with each element of the array. The purpose of
 * this is that we want to be able to pass either a selector string or a literal
 * element when setting up a list of knobs and not have to think about it.
 * @param drawer
 * @param selector
 */
function setupKnobsBySelector(drawer, selector) {
    const array = sel(selector);

    if (array.length < 1) {
        return; // nothing to do
    }

    array.map(knob => setupSingleKnob(drawer, knob));
}

/**
 * This attaches a single knob to the drawer bound to this function.
 * It's accessible on the drawer itself at `[drawer element].drawer.addKnob()`.
 * @param drawer
 * @param el
 */
function setupSingleKnob(drawer, el) {
    // Need to namespace all our knob stuff
    if (!el.hasOwnProperty(`knob`)) {
        const {settings} = drawer.drawer;
        el.knob = {
            settings: {
                doCycle: settings.knobsCycle,
                actions: settings.knobActions,
                accessibility: settings.knobAccessibility,
                drawers: new Map(),
            },
            addAction: action => el.knob.settings.actions.push(action),
        };
    }

    const {settings: {drawers}, addAction} = el.knob;

    if (drawers.has(drawer)) {
        return; // A knob can only be attached to a drawer once
    }

    // Store a reference to the drawer and its observer
    drawers.set(drawer, new MutationObserver((list, observer) => knobObserverCallback(el, list, observer)));

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
    addAction((list) => {
        for (let i = 0; i < list.length; i++) {
            const {target, attributeName} = list[i];
            if (`hidden` === attributeName) {
                knobSetAriaExpanded(el, target);
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
function knobSetAriaExpanded(el, drawer) {
    if (el.knob.settings.accessibility) {
        el.setAttribute(`aria-expanded`, !drawer.hidden);
    }
}

function knobSetAriaControls(el, drawer) {
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
function knobObserverCallback(el, mutationList, observer) {
    const {actions} = el.knob.settings;
    if (actions.length > 0) {
        actions
            .map(action => action(mutationList, el, observer));
    }
}

/**
 * Fired when the knob registers a click event.
 *
 * Only fires if `doCycle` is true. `doCycle` gets its
 * initial value from `knobsCycle` in the settings, but
 * can be independently set per knob (manually).
 */
function handleKnobClick(el) {
    const {doCycle, drawers} = el.knob.settings;
    if (doCycle) {
        drawers.forEach((observer, drawer) => {
            drawer.drawer.cycle();
        });
    }
}

export {setupKnobsBySelector, setupSingleKnob}
