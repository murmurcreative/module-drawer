interface DrawerSettingsInterface {
    states?: Array<string>;
    initState?: string;
    hash?: string;
    hashState?: string;
    hiddenStates?: Array<string>;
    actions?: Array<(list: Array<MutationRecord>, el: HTMLElement, observer: MutationObserver) => void>;
    uuid?: () => string;
    knobs?: Array<string | HTMLElement>;
    knobsCycle?: boolean;
    knobActions?: Array<(list: Array<MutationRecord>, el: HTMLElement, observer: MutationObserver) => void>;
    knobAccessibility: boolean;
}

interface IngestedSettings {
    initState?: string;
    knobs?: Array<string>;
}

interface DrawerAPI {
    mount: DrawerElement | undefined;
    settings: DrawerSettingsInterface;
    state: string;
    hidden: boolean;
    hash: string;
    actions: Array<Action>;
    knobs: Array<KnobElement>;
    hasher: {
        setUrl: () => void;
        clearUrl: () => void;
        wipeUrl: () => void;
    };
    cycle: (states: Array<string>) => void;
}

interface DrawerElement extends HTMLElement {
    drawer?: DrawerAPI;
}

interface Action {
    (list?: Array<MutationRecord>, el?: DrawerElement, observer?: MutationObserver): void;
}

interface KnobElement extends HTMLElement {
    knob?: KnobAPI;
}

interface KnobSettingsInterface {
    cycle?: boolean;
    actions?: Array<(list: Array<MutationRecord>, el: HTMLElement, observer: MutationObserver) => void>;
    accessibility?: boolean;
    drawers?: Map<HTMLElement, MutationObserver>;
}

interface KnobAPI {
    mount: KnobElement | undefined;
    settings: KnobSettingsInterface;
    actions: Array<KnobAction>;
}

interface KnobAction {
    (list?: Array<MutationRecord>, el?: KnobElement, observer?: MutationObserver): void;
}

export {DrawerSettingsInterface, IngestedSettings, DrawerAPI, DrawerElement, KnobAPI, KnobElement, KnobSettingsInterface, KnobAction}
