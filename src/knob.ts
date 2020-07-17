import {resolveLoadArguments} from "./util";
import {IKnob, IDrawer, IActions} from "./types";
import {KnobSettings} from "./settings";
import {KnobStore} from "./stores";
import {getDrawer} from "./drawer";


/**
 * Create a new knob on an element.
 *
 * ** WARNING **
 * This will not check to see if a Knob already exists on this element; you are
 * advised to check before instantiating a new knob, i.e. with getKnob().
 * Otherwise you will like get undesirable behavior.
 *
 * @param el
 * @param userArguments
 * @constructor
 */
function Knob(el: HTMLElement, userArguments?: IKnob.Settings | object | undefined) {
    this.settings = new KnobSettings();
    this.store = new KnobStore();

    // Proxy things in settings and stores to the Knob itself
    Object.defineProperties(this, {
        mount: {
            get: (): IKnob.Element => this.store.mount,
            set: (element) => this.store.mount = element,
        },
        actions: {
            get: () => this.store.actions,
            set: (action: IActions.Observe) => this.store.actions = action
        },
        drawers: {
            get: () => this.store.drawers,
            set: (drawers: string | HTMLElement | Array<HTMLElement | string>) => this.store.drawers = drawers,
        },
    });

    // Attach API
    this.mount = el;
    this.mount.knob = this;

    loadUserArguments.bind(this)(userArguments);

    this.actions = handleAriaExpandedState;

    this.mount.addEventListener(`knob.drawerAdded`, handleDrawerAddedEvent.bind(this));
    this.mount.addEventListener(`click`, handleClick.bind(this));
}

/**
 * Get the knob on an element.
 * @param el
 */
function getKnob(el: HTMLElement | IKnob.Element): IKnob.API | undefined {
    if (`knob` in el) {
        return el.knob;
    }
    return undefined;
}

/**
 * Actions to be executed when a drawer is added to this Knob.
 * @param event
 */
function handleDrawerAddedEvent(event: IKnob.Event) {
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
function handleAriaExpandedState(list: Array<MutationRecord>, api: IKnob.API) {
    for (let i = 0; i < list.length; i++) {
        const {attributeName, target} = list[i];
        if (`hidden` === attributeName) {
            setAriaExpanded(api, getDrawer((target as HTMLElement)));
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

/**
 * Handle loading arguments passed directly, and described on the element.
 * @param userArguments
 */
function loadUserArguments(userArguments: IKnob.Settings) {
    const allowedSettings = Object.keys(this.settings);
    const allowedStores = Object.keys(this.store);
    const collectedArguments = new Map();

    const {dataset} = this.mount;
    if (dataset.cycle) collectedArguments.set('cycle', dataset.cycle === `true`);
    if (dataset.accessibility) collectedArguments.set('accessibility', dataset.accessibility === `true`);

    resolveLoadArguments.bind(this)(userArguments, collectedArguments, allowedSettings, allowedStores)
}

export {Knob, getKnob}
