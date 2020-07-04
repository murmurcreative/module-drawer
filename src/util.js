/**
 * Is this an element?
 * @param el
 * @returns {boolean}
 */
const isEl = el => el instanceof Element || el instanceof HTMLDocument;

/**
 * Get an array of elements matching a string, or return an element passed.
 * @param el
 * @returns {array}
 */
const sel = el => (typeof el === `string`)
    ? Array.from(document.querySelectorAll(el))
    : isEl(el) ? [el] : [];

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
