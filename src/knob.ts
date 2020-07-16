import {isEl, sel} from "./util";
import {
    DrawerElement,
    KnobElement,
    KnobAction,
    KnobSettingsInterface,
    DrawerAPI,
    KnobAPI,
    IKnob,
    IDrawer
} from "./types";
import {KnobSettings} from "./settings";
import {KnobStore} from "./stores";

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
 * ** WARNING **
 * This will not check to see if a Knob already exists on this element; you are
 * advised to check before instantiating a new knob, i.e. with getKnob().
 * Otherwise you will like get undesirable behavior.
 *
 * @param el
 * @param userSettings
 * @constructor
 */
function Knob(el: IKnob.Element, userSettings) {
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
    });

    // Attach API
    this.mount = el;
    this.mount.knob = this;

    this.actions = handleAriaExpandedState;

    this.mount.addEventListener(`knob.drawerAdded`, handleDrawerAddedEvent.bind(this));
    this.mount.addEventListener(`click`, handleClick.bind(this));
}

/**
 * Actions to be executed when a drawer is added to this Knob.
 * @param event
 */
function handleDrawerAddedEvent(event) {
    const {drawer} = event.detail.drawer;

    setAriaExpanded(this, drawer);
    setAriaControls(this, drawer);
}

/**
 * Handle changing aria-expanded when the attached drawer is hidden
 * (or not).
 * @param list
 * @param api
 */
function handleAriaExpandedState(list, api: IKnob.API) {
    for (let i = 0; i < list.length; i++) {
        const {attributeName, target: { drawer }} = list[i];
        if (`hidden` === attributeName) {
            setAriaExpanded(api, drawer);
        }
    }
}

/**
 * Handles setting the aria-expanded attribute on the knob.
 * @param api
 * @param drawer
 */
function setAriaExpanded(api: IKnob.API, drawer: IDrawer.API) {
    if (api.settings.accessibility) {
        api.mount.setAttribute(`aria-expanded`, String(!drawer.hidden));
    }
}

/**
 * Handles setting up the aria-controls attribute on the knob.
 * @param api
 * @param drawer
 */
function setAriaControls(api: IKnob.API, drawer: IDrawer.API) {
    if (api.settings.accessibility) {
        api.mount.setAttribute(`aria-controls`, drawer.mount.id);
    }
}

/**
 * Fired when the knob registers a click event.
 *
 * Only fires if `doCycle` is true. `doCycle` gets its
 * initial value from `knobsCycle` in the settings, but
 * can be independently set per knob (manually).
 */
function handleClick() {
    const {settings: {cycle}, drawers} = this;
    if (cycle) {
        drawers.forEach((observer: MutationObserver, drawer: IDrawer.Element) => {
            drawer.drawer.cycle();
        });
    }
}

export {Knob, getKnob}
