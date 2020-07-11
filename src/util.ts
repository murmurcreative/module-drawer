/**
 * Is this an element?
 * @param el
 * @returns {boolean}
 */
const isEl = (el: any): boolean => (el instanceof Element) || (el instanceof HTMLDocument);

const tagRegex = /^\w*.$/;
const idRegex = /^#[\w_-]*.$/;
const classRegex = /^\.[\w_-]*.$/;

/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {HTMLElement[]}
 */
const sel = (el: any): Array<HTMLElement> => {
    // Return immediately, but in an array
    if (isEl(el)) return [el];
    // Not an arg we understand
    if (typeof el !== `string`) return [];
    // Tag argument, use faster search
    if (tagRegex.test(el)) return Array.prototype.slice.call(document.getElementsByTagName(el));
    // ID argument, use faster search
    if (idRegex.test(el)) return [document.getElementById(el.slice(1))];
    // Class argument, use faster search
    if (classRegex.test(el)) return Array.prototype.slice.call(document.getElementsByClassName(el.slice(1)));
    // Just use querySelectorAll
    return Array.prototype.slice.call(document.querySelectorAll(el));
};

/**
 * Merges two objects.
 *
 * Different from Object.assign in that it does not modify the `target`
 * object; it creates a copy on the fly.
 *
 * Currently just a wrapper for Object.assign, but abstracted in case this
 * logic needs to become more detail (i.e. a deeper merge).
 * @param target
 * @param defaults
 * @returns {object}
 */
const merge = (target: object, defaults: object): object => {
    return Object.assign(Object.assign({}, target), defaults);
};

/**
 * Replicates .flat() for arrays with only a single level of depth.
 *
 * This is to handle browsers (i.e. IE) that don't support .flat().
 * @param arr
 * @return {any[]}
 */
const flattenSingle = (arr: Array<any>): Array<any> => arr.reduce((acc, val) => acc.concat(val), []);

/**
 * Generate a pretty unique ID.
 *
 * *IMPORTANT*
 *
 * This is intended to be pretty random, and fairly cryptographically
 * secure, but if you really need that I'd recommend importing a package
 * and using that; This is just a simple implementation so I can avoid
 * a dependency.
 *
 * @link https://stackoverflow.com/a/2117523
 * @returns {string}
 */
function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export {isEl, sel, merge, flattenSingle, uuid}
