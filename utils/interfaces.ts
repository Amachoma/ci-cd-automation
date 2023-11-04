export enum CssUnits {
    NONE = "",
    PIXEL = "px",
    PERCENT = "%",
    VIEWPORT_WIDTH = "vw",
    VIEWPORT_HEIGHT = "vh",
    FRACTION = "fr",
}

export interface Padding {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}

export interface Rect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface Position2D {
    x: number;
    y: number;
}

export interface Dimensions2D {
    width: number;
    height: number;
}

export interface Direction2D {
    vertical: "top" | "bottom";
    horizontal: "left" | "right";
}