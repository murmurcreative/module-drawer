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

interface KnobSetupObject {
    elements?: Array<HTMLElement | string>;
    settings?: KnobSettingsInterface;
}

namespace IDrawer {
    export interface Initialize {
        settings: IDrawer.Settings;
        knobs: Array<string | HTMLElement> | IDrawer.KnobSetup;
        actions: Array<IActions.Observe>;
    }

    export interface Settings extends ISettings.Default {
        inStates: (state: string) => boolean;
        states: Array<string>;
        initState: string;
        hiddenStates: Array<string>;
        hash: string;
        hashState: string;
        uuid: () => string;
        defaults: IDrawer.Settings;
    }

    export interface Store extends IStores.Default {
        mount: IDrawer.Element;
        knobs: Map<IKnob.Element, IKnob.API>;
    }

    export interface KnobSetup {
        elements: Array<HTMLElement | string>;
        settings: IKnob.Settings;
        actions: Array<IActions.Observe>;
    }

    export interface Element extends HTMLElement {
        drawer: IDrawer.API;
    }

    export interface API {
        mount: IDrawer.Element;
        hidden: boolean;
        settings: IDrawer.Settings;
        state: string;
        cycle: (states?: Array<string>) => void;
        store: IDrawer.Store;
        hasher: {
            setUrl: () => void;
            clearUrl: () => void;
            wipeUrl: () => void;
        }
    }
}

namespace IKnob {
    export interface Settings extends ISettings.Default {
        cycle: boolean;
        accessibility: boolean;
        defaults: IKnob.Settings;
    }

    export interface Store extends IStores.Default {
        drawers: Map<IDrawer.Element, MutationObserver>;
    }

    export interface Element extends HTMLElement {
        knob: IKnob.API;
    }

    export interface API {
        store: IKnob.Store;
        settings: IKnob.Settings;
        mount: IKnob.Element;
        actions: Map<string, IActions.Observe>;
        drawers: Map<IDrawer.Element, MutationObserver>;
    }

    export interface Event extends CustomEvent {
        detail: {
            drawer: IDrawer.Element,
        }
    }
}

namespace IActions {

    export interface Observe {
        (list: Array<MutationRecord>, api: IDrawer.API | IKnob.API, observer: MutationObserver): void;
    }
}

namespace IStores {
    export interface Default {
        repo: Map<string, any>;
        mapGet: Map<string, any>;
        arrayGet: Array<any>;
        mount: HTMLElement;
        actions: Map<string, IActions.Observe>;
    }
}

namespace ISettings {
    export interface Default {
        repo: Map<string, any>;
        append: (name: string, row: any) => void;
    }
}

namespace IUtil {
    export interface SelResult {

    }
}

export {
    DrawerSettingsInterface,
    IngestedSettings,
    DrawerAPI,
    DrawerElement,
    KnobAPI,
    KnobElement,
    KnobSettingsInterface,
    KnobAction,
    IKnob,
    IDrawer,
    IActions,
    ISettings,
}
