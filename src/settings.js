export default settings => {
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
         * Functions to be run when the drawer observes a change it its
         * state or hidden attribute.
         */
        actions: [],
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
    }, settings || {});
};
