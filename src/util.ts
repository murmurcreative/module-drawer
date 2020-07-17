/**
 * Is this an element?
 * @param el
 * @returns {boolean}
 */
import {ISettings} from "./types";

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
 * Replicates .flat() for arrays with only a single level of depth.
 *
 * This is to handle browsers (i.e. IE) that don't support .flat().
 * @param arr
 * @return {any[]}
 */
const flattenSingle = (arr: Array<any>): Array<any> => arr.reduce((acc, val) => acc.concat(val), []);

/**
 * Attempts to make something (usually a string) in a url-safe string.
 *
 * @param string
 * @return string
 */
const urlify = (string: any): string => string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

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

/**
 * Bind to drawers/knobs and use to resolve passed and read arguments.
 * @param user
 * @param collected
 * @param settings
 * @param stores
 */
function resolveLoadArguments(
    user: ISettings.Default,
    collected: Map<string, any>,
    settings: Array<string>,
    stores: Array<string>,
): void {
    if (typeof user === 'object') {
        Object.keys(user).map((key: string) => {
            // Skip args that have already been set
            if (!collected.has(key)) {
                if (settings.indexOf(key) > -1
                    || stores.indexOf(key) > -1) {
                    collected.set(key, user[key]);
                }
            }
        })
    }

    if (collected.size > 0) {
        collected.forEach((value: any, key: string) => {
            /**
             * This assumes there will be no overlap, and if there is, then
             * settings will take precedence.
             */
            if (settings.indexOf(key) > -1) {
                this.settings[key] = value;
            } else if (stores.indexOf(key) > -1) {
                this.store[key] = value;
            }
        });
    }
}

/**
 * Bound to stores and settings objects to return their defaults.
 */
function getDefaults(): Map<string, any> {
    const defaults = new Map();
    Object.keys(this).map(key => {
        defaults.set(key, this[key]);
    });
    return defaults;
}

export {isEl, sel, flattenSingle, urlify, uuid, getDefaults, resolveLoadArguments}
