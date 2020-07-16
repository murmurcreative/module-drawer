import {flattenSingle, isEl, sel, uuid} from "./util";
import {getKnob, Knob} from "./knob";
import {IDrawer, IKnob} from "./types";
import {getDrawer} from "./drawer";

function getImmutableMap(key, fallback) {
    if (undefined === fallback) {
        fallback = [];
    }
    return new Map(this.repo.get(key) || fallback);
}

function getImmutableArray(key, fallback) {
    if (undefined === fallback) {
        fallback = [];
    }
    const array = this.repo.get(key) || fallback;
    return [...array];
}

/**
 * Set up a basic store.
 * @param store
 */
function setUpStore(store) {
    store.repo = new Map();

    store.mapGet = getImmutableMap.bind(store);

    Object.defineProperties(store, {
        mount: {
            get: () => store.repo.get('mount') || undefined,
            set: (element) => {
                // Can only be mounted once
                if (!isEl(store.repo.get('mount')) && isEl(element)) {
                    store.repo.set('mount', element);
                }
            }
        },
        actions: {
            get: () => store.mapGet('actions'),
            set: (action) => {
                // "lazy"-initialization
                if (store.actions.size < 1) {
                    store.repo.set('actions', store.actions);
                }

                let actions;
                if (Array.isArray(action)) {
                    actions = action.map(flattenSingle);
                } else {
                    actions = [action];
                }

                actions
                    .map((action) => store.repo.get('actions')
                        .set((action.name || uuid()), action));
            }
        },
    });
}

function DrawerStore() {
    setUpStore(this);

    Object.defineProperties(this, {
        knobs: {
            get: (): Map<IKnob.Element, IKnob.API> => this.mapGet('knobs'),
            set: (arg: Array<string | HTMLElement> | string | HTMLElement | IDrawer.KnobSetup) => {
                if (this.knobs.size < 1) {
                    this.repo.set('knobs', this.knobs);
                }
                let knobs;
                let settings = {};
                if (Array.isArray(arg)) {
                    knobs = flattenSingle(arg.map(sel));
                } else if (arg.hasOwnProperty('elements') && arg.hasOwnProperty('settings')) {
                    /**
                     * This allows for passing knob settings by passing an object with
                     * the following shape:
                     * {
                     *     elements: ['selector', elementObject],
                     *     settings: {
                     *         doCycle: true,
                     *         accessibility: false,
                     *         ...
                     *     }
                     * }
                     */
                    const {settings, elements} = <IDrawer.KnobSetup>arg;
                    knobs = flattenSingle(elements.map(sel));
                } else {
                    knobs = sel(arg);
                }
                knobs.map(knob => {
                    // Settings are only applied if this is a new Knob.
                    const api = getKnob(knob) || new Knob(knob, settings);
                    api.drawers = this.mount; // Knob will take care of the rest
                });
            }
        },
    })
}

function KnobStore() {
    setUpStore(this);

    Object.defineProperties(this, {
        drawers: {
            get: () => this.mapGet('drawers'),
            set: (drawer) => {
                // "lazy"-initialization
                if (this.drawers.size < 1) {
                    this.repo.set('drawers', this.drawers)
                }

                let drawers;
                if (Array.isArray(drawer)) {
                    drawers = drawer.map(sel).map(flattenSingle);
                } else {
                    drawers = sel(drawer);
                }

                drawers
                    .filter((drawer: IDrawer.Element) => {
                        return getDrawer(drawer) !== undefined
                    })
                    .map(drawer => {
                        // Create observer
                        const observer = new MutationObserver((list, observer) => {
                            if (this.repo.get('actions').size > 0) {
                                this.repo.get('actions').forEach((action) => {
                                    action(list, this.repo.get('mount').knob, observer);
                                })
                            }
                        });

                        // Start observer
                        observer.observe(drawer, {
                            attributes: true,
                            attributeFilter: [`data-states`, `hidden`],
                            attributeOldValue: true,
                            childList: false,
                            subtree: false,
                        });

                        // Store drawer and observer
                        this.repo.get('drawers').set(drawer, observer);

                        // Tell the Drawer that this Knob is attached
                        drawer.drawer.store.repo.get('knobs')
                            .set(this.repo.get('mount'), this.repo.get('mount').knob);

                        // Tell the knob we've added a drawer
                        this.repo.get('mount').dispatchEvent(
                            new CustomEvent('knob.drawerAdded', {
                                detail: {
                                    drawer: drawer,
                                }
                            }));

                    });
            },
        },
    })
}

export {KnobStore, DrawerStore}
