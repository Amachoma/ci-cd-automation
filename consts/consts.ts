export const animConfigs = {
    default: { mass: 1, tension: 170, friction: 26 },
    wobbly: { mass: 5, tension: 500, friction: 80 },
    gentle: { mass: 1, tension: 120, friction: 14 },
    molasses: { mass: 1, tension: 280, friction: 120 },
    contextMenu: { mass: 1, tension: 120, friction: 14, precision: 0.0125 },
};

export const themeSymbols: { [key: string]: string } = {
    "@": "accent__primary",
    "#": "accent__secondary",
};

export const EMPTY_READING = "✖";

export enum ViewModes {
    ENDLESS = "endless",
    PAGINATION = "pagination",
}

export enum SORT_TYPES {
    TITLE = "title",
    DATE = "date",
}

export enum SORT_ORDERS {
    DESC = "desc",
    ASC = "asc",
}

export enum FONT_WEIGHT {
    THIN = 100,
    EXTRA_LIGHT = 200,
    LIGHT = 300,
    REGULAR = 400,
    MEDIUM = 500,
    SEMI_BOLD = 600,
    BOLD = 700,
    EXTRA_BOLD = 800,
    BLACK = 900,
}

export const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const MAX_DATE = new Date(32503647600000);

export const CREATE_MODAL_EVENT = "createModal";
