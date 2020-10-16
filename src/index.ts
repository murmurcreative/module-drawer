import polyfill from "./polyfills";
import {sel} from "./util";
import {Drawer, getDrawer, cycle} from "./drawer";
import {Knob, getKnob} from "./knob";
import {IDrawer} from "./types";

// Set up our polyfills before we do anything else
polyfill();

/**
 * Set up all drawers we can find.
 * @param selector
 * @param userSettings
 */
function Cabinet(selector?: HTMLElement | string, userSettings?: IDrawer.Settings) {
    const drawers = sel(selector || `[data-module="drawer"]`);
    if (drawers.length < 1) {
        return; // There are no drawers
    }

    return drawers.map((drawer: HTMLElement) => new Drawer(drawer, userSettings));
}

export {Cabinet, Drawer, getDrawer, cycle, Knob, getKnob}
