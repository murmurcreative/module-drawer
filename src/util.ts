/**
 * Is this an element?
 * @param el
 * @returns {boolean}
 */
const isEl = el => el instanceof Element || el instanceof HTMLDocument;

const tagRegex = /^\w*.$/;
const idRegex = /^#[\w_-]*.$/;
const classRegex = /^\.[\w_-]*.$/;

/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {array}
 */
const sel = el => {
    // Return immediately, but in an array
    if (isEl(el)) return [el];
    // Not an arg we understand
    if (typeof el !== `string`) return [];
    // ID argument, use faster search
    if (idRegex.test(el)) return [document.getElementById(el.slice(1))];
    // Tag argument, use faster search
    if (tagRegex.test(el)) return Array.from(document.getElementsByTagName(el));
    // Class argument, use faster search
    if (classRegex.test(el)) return Array.from(document.getElementsByClassName(el));
    // Just use querySelectorAll
    return Array.from(document.querySelectorAll(el));
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
 * @returns {*}
 */
const merge = (target, defaults) => {
    return Object.assign(Object.assign({}, target), defaults);
};

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
 * @returns {void | string | *}
 */
function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export {isEl, sel, merge, uuid}
