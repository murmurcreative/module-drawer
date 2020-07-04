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

export {isEl, sel, merge}
