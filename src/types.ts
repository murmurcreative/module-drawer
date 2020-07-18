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

    export interface KnobSetupSettings extends IKnob.Settings {
        actions: Array<IActions.Observe>;
    }

    export interface KnobSetup {
        elements: Array<HTMLElement | string>;
        settings: KnobSetupSettings;
    }

    export interface Element extends HTMLElement {
        drawer: IDrawer.API;
    }

    export interface Event extends CustomEvent {
        detail: {
            knob: IKnob.Element,
            drawer?: IDrawer.Element,
        }
    }

    export interface API {
        mount: IDrawer.Element;
        hidden: boolean;
        settings: IDrawer.Settings;
        state: string;
        cycle: (states?: Array<string>) => void;
        store: IDrawer.Store;
        actions: Map<string, IActions.Observe>;
        knobs: Map<IKnob.Element, IKnob.API>;
        detachKnob: (knob: IKnob.Element) => void;
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
        detachDrawer: (drawer: IDrawer.Element) => void;
    }

    export interface Event extends CustomEvent {
        detail: {
            drawer: IDrawer.Element,
            knob?: IKnob.Element,
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
    IKnob,
    IDrawer,
    IActions,
    ISettings,
}
