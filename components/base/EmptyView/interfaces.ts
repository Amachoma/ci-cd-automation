import React from "react";

export enum EMPTY_VIEW_TEXT_TYPES {
    TEXT,
    BUTTON,
    LINK,
    BREAK,
}

export interface BaseProps {
    type: EMPTY_VIEW_TEXT_TYPES;
    label?: string;
    onClick?: (e: React.MouseEvent) => void;
    href?: string;
}

export interface EmptyViewProps {
    message: BaseProps[];
    icon?: JSX.Element;
}
