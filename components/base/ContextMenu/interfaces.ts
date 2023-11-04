import { FC, SVGProps } from "react";
import { CONTEXT_MENU_ICONS } from "@/icons/icons";
import { Position2D, Rect } from "@/utils/interfaces";

// TODO: cleanup interfaces
export interface ItemProps {
    text: string;
    // Icon: FC<SVGProps<SVGSVGElement>>;
    clickHandler: () => void;
    textColor?: string;
    icon?: string;
    iconColor?: string;
}

export interface PayloadItemProps {
    id: string;
    text: string;
    icon?: CONTEXT_MENU_ICONS;
    textColor?: string;
    iconColor?: string;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface ContextState {
    pos: Position2D;
    dimensions: Dimensions;
    rect: Rect;
    pivot: string;
}

export interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    items: PayloadItemProps[][];
    closeHandler: () => void;
    itemClickHandler: (actionId: string, itemId: string) => void;
    itemId: string;
}

export enum POINTER_EVENT_TYPES {
    NONE = "none",
    AUTO = "auto",
}
