import {Settings} from "./types";

function defaults(settings: Settings): Settings {
    return Object.assign({
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
            `open`,
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
         * The hash will be appended to the URL when the Drawer is in the state
         * described in hashState. If hash is not a string with a length greater
         * than one, all hash functionality is disabled. If hash is valid, but
         * hashState is not, then the de facto hash-state will be the first non-
         * hidden state found in states.
         */
        hash: '',
        /**
         * When this state is active on the drawer, the hash will be added to the
         * url, and this state will be activated if the hash is in the URL. If
         * this is set but hash is not valid, nothing will happen.
         */
        hashState: '',
        /**
         * Functions to be run when the drawer observes a change it its
         * state or hidden attribute.
         */
        actions: [],
        /**
         * If you need better uuids, pass a callback to this function that
         * generates them.
         */
        uuid: undefined,
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
        /**
         * Whether or not to enable accessibility features on knobs.
         * Generally this should be true, but for some knob use cases
         * (i.e. non-interactive knobs) accessibility features may be
         * unnecessary or problematic.
         */
        knobAccessibility: true,
    }, settings || {});
}

export {defaults, Settings}
