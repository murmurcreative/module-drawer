import {isValidHash} from "./hash";
import {getDefaults, urlify, uuid} from "./util";

function setUpSettings(settings) {
    Object.defineProperties(settings, {
        repo: {
            value: new Map(),
            writable: true,
        },
        append: {
            value: append.bind(settings),
        },
    });
}

/**
 * This will append items to a settings item that is an array.
 *
 * Bind it to your settings object and you're off to the races.
 * @param name
 * @param row
 */
function append(name: string, row: any) {
    if (!this.repo.has(name)) {
        this.repo.set(name, [row]);
    } else {
        let current = this.repo.get(name);
        current.push(row);
        this.repo.set(name, current);
    }
}

function DrawerSettings() {
    setUpSettings(this);

    Object.defineProperties(this, {
        inStates: {
            value: (state: string): boolean => this.states.indexOf(state) > -1,
        },
        /**
         * This is a list of states the drawer can have. The names of the terms have
         * no internal meaning: They will be used to populated `data-state` and will
         * be matched against by `hiddenStates`, but they're essentially arbitrary.
         *
         * `cycle()` will move from the current state to the next state in this list,
         * and then start again from the first item when it reaches the end.
         */
        states: {
            enumerable: true,
            get: () => this.repo.get('states') || [`open`, `closed`],
            set: (arg: string | Array<string>) => {
                if (typeof arg === 'string') {
                    append('states', arg);
                } else if (Array.isArray(arg)) {
                    this.repo.set('states', arg);
                }
            }
        },
        /**
         * This is the state that the drawer should start in. If it's not set,
         * it'll default to the first state described in `states`.
         */
        initState: {
            enumerable: true,
            get: () => this.repo.get('initState') || this.states[0],
            set: (arg: string) => {
                if (typeof arg === 'string' && this.inStates(arg)) {
                    this.repo.set('initState', arg);
                } else {
                    this.repo.set('initState', false);
                }
            }
        },
        /**
         * These are states from the `states` array that are considered "closed".
         * Without other configuration, this means that when the drawer enters one
         * of these states, it will receive the `hidden` attribute, and ann attached
         * knobs will get `aria-expanded="false"`.
         *
         * To disable this behavior, just make this an empty array.
         */
        hiddenStates: {
            enumerable: true,
            get: () => this.repo.get('hiddenStates') || [`closed`],
            set: (arg: string | Array<string>) => {
                if (typeof arg === 'string' && this.inStates(arg)) {
                    append('hiddenStates', arg);
                } else if (Array.isArray(arg)) {
                    const validHiddenStates = arg.filter(state => this.inStates(state));
                    this.repo.set('hiddenStates', validHiddenStates);
                }
            }
        },
        /**
         * The hash will be appended to the URL when the Drawer is in the state
         * described in hashState. If hash is not a string with a length greater
         * than one, all hash functionality is disabled. If hash is valid, but
         * hashState is not, then the de facto hash-state will be the first non-
         * hidden state found in states.
         */
        hash: {
            enumerable: true,
            get: () => this.repo.get('hash') || '',
            set: (arg: string) => {
                if (isValidHash(arg)) {
                    this.repo.set('hash', urlify(arg));
                }
            }
        },
        /**
         * When this state is active on the drawer, the hash will be added to the
         * url, and this state will be activated if the hash is in the URL. If
         * this is set but hash is not valid, nothing will happen.
         */
        hashState: {
            enumerable: true,
            get: () => {
                if (!this.repo.get('hashState')) {
                    const nonHiddenStates = this.states
                        .filter(x => this.hiddenStates.indexOf(x) < 0);
                    return nonHiddenStates[0] || '';
                }
                return this.repo.get('hashState');
            },
            set: (arg: string) => {
                if (typeof arg === 'string' && this.inStates(arg) && this.repo.get('hiddenState').indexOf(arg) < 0) {
                    this.repo.set('hashState', arg);
                }
            }
        },
        /**
         * If you need better uuids, pass a callback to this function that
         * generates them.
         */
        uuid: {
            enumerable: true,
            get: () => this.repo.get('uuid') || uuid,
            set: (arg: Function) => {
                this.repo.set('uuid', arg);
            }
        },
    });

    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });
}

function KnobSettings() {
    setUpSettings(this);

    Object.defineProperties(this, {
        /**
         * When true, clicking this knob will cycle all attached drawers.
         */
        cycle: {
            enumerable: true,
            get: () => this.repo.get('cycle') || true,
            set: (arg) => this.repo.set(`cycle`, Boolean(arg)),
        },
        /**
         * When true, this will enable all knob-related accessiblity featured,
         * mainly aria attributes.
         */
        accessibility: {
            enumerable: true,
            get: () => this.repo.get('actions') || true,
            set: (arg) => this.repo.set('actions', Boolean(arg))
        },
    });

    // Now set up defaults
    Object.defineProperty(this, 'defaults', {
        value: getDefaults.bind(this)(),
    });

}

export {DrawerSettings, KnobSettings}
