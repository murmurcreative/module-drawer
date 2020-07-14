import {flattenSingle, isEl, sel, uuid} from "./util";

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

function KnobStore() {
    this.repo = new Map();

    const mapGet = getImmutableMap.bind(this);

    Object.defineProperties(this, {
        mount: {
            get: () => this.repo.get('mount') || undefined,
            set: (element) => {
                // Can only be mounted once
                if (!isEl(this.repo.get('mount')) && isEl(element)) {
                    this.repo.set('mount', element);
                }
            }
        },
        drawers: {
            get: () => mapGet('drawers'),
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
                    .map(drawer => {
                        // Create observer
                        const observer = new MutationObserver((list, observer) => {
                            if (this.repo.get('actions').size > 0) {
                                this.repo.get('actions').forEach((action) => {
                                    action(list, this.repo.get('mount'), observer);
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
        actions: {
            get: () => mapGet('actions'),
            set: (action) => {
                // "lazy"-initialization
                if (this.actions.length < 1) {
                    this.repo.set('actions', this.actions);
                }

                let actions;
                if (Array.isArray(action)) {
                    actions = action.map(sel).map(flattenSingle);
                } else {
                    actions = sel(action);
                }

                actions
                    .map((action) => this.repo.get('actions').set((action.name || uuid()), action));
            }
        },
    })
}

export {KnobStore}
