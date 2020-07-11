import {flattenSingle, isEl, merge, sel, uuid} from '../src/util';
import {expect} from "@jest/globals";

// Set up an element for testing
const element = document.createElement('div');
element.id = 'element';
element.setAttribute('class', 'element-class');
document.body.insertBefore(element, null);

test("An element is an element", () => {
    expect(isEl(document.getElementById('element'))).toBe(true);
    expect(isEl('string')).toBe(false);
});

test("sel() always returns an array", () => {
    expect(Array.isArray(sel('#element'))).toBe(true);
    expect(Array.isArray(sel('.element-class'))).toBe(true);
    expect(Array.isArray(sel('div'))).toBe(true);
    expect(Array.isArray(sel('div#element.element-class'))).toBe(true);
    expect(Array.isArray(sel('#does-not-exist'))).toBe(true);
    expect(Array.isArray(sel(document.getElementById('element')))).toBe(true);
});

test("sel() returns correct elements", () => {
    const getEl = document.getElementById('element');
    expect(sel('#element')).toContain(getEl);
    expect(sel('.element-class')).toContain(getEl);
    expect(sel('div')).toContain(getEl);
    expect(sel('div#element.element-class')).toContain(getEl);
});

test("merge() merges objects, overriding collisions in second arg", () => {
    const obj1 = {
        a: 1,
        b: 2,
    };

    const obj2 = {
        b: 3,
        c: 4,
    };

    const merged = merge(obj1, obj2);
    expect(merged.a).toBe(1);
    expect(merged.c).toBe(4);
    expect(merged.b).toBe(3);
});

test("merge() doesn't modify original objects", () => {
    const obj1 = {
        a: 1,
        b: 2,
    };

    const obj2 = {
        b: 3,
        c: 4,
    };

    const merged = merge(obj1, obj2);
    expect(obj1.b).toBe(2);
    expect(obj2.a).toBe(undefined);
});

test("flattenSingle() flattens array, but only one level", () => {
    const arr1 = [
        'a',
        'b',
        [
            'c',
            ['d'],
        ],
    ];

    const flattened = flattenSingle(arr1);
    expect(flattened[2]).toBe('c');
    expect(flattened[3]).toStrictEqual(['d']);
});

test("uuid() generates valid uuid", () => {
    const uid = uuid();
    const isUUID = require('is-uuid');
    expect(isUUID.v4(uid)).toBe(true);
});
