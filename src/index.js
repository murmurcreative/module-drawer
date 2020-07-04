import {sel} from "./util";
import {Drawer} from "./drawer";


/**
 * Set up all drawers we can find.
 * @param selector
 * @param userSettings
 */
function Cabinet(selector, userSettings) {
    const drawers = sel(selector || `[data-module="drawer"]`);
    if (drawers.length < 1) {
        return; // There are no drawers
    }

    return drawers.map(drawer => new Drawer(drawer, userSettings));
}

export {Cabinet, Drawer}
