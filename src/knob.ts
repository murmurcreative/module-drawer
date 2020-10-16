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
 * Otherwise you will likely get undesirable behavior.
 *
 * @param el
 * @param userArguments
 * @constructor
 */
function Knob(el: HTMLElement, userArguments?: IKnob.Settings | object | undefined) {
    Object.defineProperties(this, {
        settings: {
            value: new KnobSettings(),
            writable:true,
        },
        store: {
            value: new KnobStore(),
            writable: true,
        },
        mount: {
            get: (): IKnob.Element => this.store.mount,
            set: (element) => this.store.mount = element,
        },
        actions: {
            get: () => this.store.actions,
            set: (action: IActions.Observe) => this.store.actions = action
        },
        drawers: {
            get: (): Map<IDrawer.Element, MutationObserver> => this.store.drawers,
            set: (drawers: string | HTMLElement | Array<HTMLElement | string>) => this.store.drawers = drawers,
        },
        detachDrawer: {
            value: (drawer: IDrawer.Element) => {
                const event = new CustomEvent('knob.drawerRemoved', {
                    detail: {
                        drawer: drawer,
                        knob: this.mount,
                    },
                });
                this.mount.dispatchEvent(event);
                drawer.dispatchEvent(event);
            },
        }
    });

    // Attach API
    this.mount = el;
    this.mount.knob = this;

    this.actions = handleAriaExpandedState;

    this.mount.addEventListener(`knob.drawerAdded`, handleDrawerAddedEvent.bind(this));
    this.mount.addEventListener(`knob.drawerRemoved`, handleRemovalEvent.bind(this));
    this.mount.addEventListener(`drawer.knobRemoved`, handleRemovalEvent.bind(this));
    this.mount.addEventListener(`click`, handleClick.bind(this));

    loadUserArguments.bind(this)(userArguments);
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
    const {drawer: api} = event.detail.drawer;

    setAriaExpanded(this, api);
    setAriaControls(this, api);
}

/**
 * Actions to be executed when a drawer is removed from this Knob.
 * @param event
 */
function handleRemovalEvent(event: IKnob.Event) {
    const {detail: {drawer}, type} = event;
    switch (type) {
        case 'knob.drawerRemoved':
        case 'drawer.knobRemoved':
            if (this.drawers.has(drawer)) {
                // Turn off observation
                this.drawers.get(drawer).disconnect();

                // Remove Drawer
                this.store.repo.get('drawers').delete(drawer);
            }
            break;
    }
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
            getDrawer(drawer)?.cycle();
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
