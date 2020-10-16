function setHash(hash: string): void {
    history.pushState(null, null, `#${hash}`);
}

/**
 * Get the current hash string.
 */
function extractHash(): string {
    return window.location.hash.slice(1);
}

/**
 * Removes hash, if it matches hash on this Drawer.
 * @param hash string
 */
function clearHash(hash: string): void {
    if (hash && extractHash() === hash) {
        wipeHash();
    }
}

/**
 * Removes *any* existing hash.
 */
function wipeHash() {
    history.pushState(null, null, window.location.pathname);
}

/**
 * Is this a valid hash or not?
 * @param test
 */
function isValidHash(test: any): boolean {
    return (typeof test === 'string') && test.length > 0;
}

/**
 * If test is a valid hash, then run the call back with test as an argument.
 * @param test
 * @param callback
 */
function ifValidHash(test: any, callback: Function) {
   if (isValidHash(test)) {
       callback(test);
   }
}

export {setHash, extractHash, clearHash, wipeHash, isValidHash, ifValidHash}
