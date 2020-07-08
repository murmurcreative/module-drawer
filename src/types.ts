interface Settings {
    states?: Array<string>;
    initState?: string;
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
    settings: Settings;
    getState: () => string;
    setState: (state: string) => void;
    setHidden: (hide: boolean) => void;
    addKnob: (knob: HTMLElement) => void;
    addAction: (action: Action) => void;
    cycle: (states?: Array<string>) => void;
}

interface Drawer extends HTMLElement {
    drawer?: DrawerAPI;
}

interface Action {
    (list?: Array<MutationRecord>, el?: Drawer, observer?: MutationObserver): void;
}

interface Knob extends HTMLElement{
    knob?: KnobAPI;
}

interface KnobSettings {
    doCycle?: boolean;
    actions?: Array<(list: Array<MutationRecord>, el: HTMLElement, observer: MutationObserver) => void>;
    accessibility?: boolean;
    drawers?: Map<HTMLElement, MutationObserver>;
}

interface KnobAPI {
    settings: KnobSettings;
    addAction: Function;
}

interface KnobAction {
    (list?: Array<MutationRecord>, el?: Knob, observer?: MutationObserver): void;
}

export {Settings, IngestedSettings, DrawerAPI, Drawer, KnobAPI, Knob, KnobSettings, KnobAction}
