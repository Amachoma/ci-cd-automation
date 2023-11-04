import React, { FunctionComponent, MouseEvent } from "react";
import { PayloadItemProps } from "@/components/base/ContextMenu/interfaces";
import { Rect } from "@/utils/interfaces";
import { ResizeConfig } from "@/hooks/mediaQuery/interfaces";
import { CheckboxResizeConfig } from "@/components/base/RoundCheckbox/interfaces";

// export type ItemProps<T> = Omit<T, keyof ContextMenuProp> & { [key: string]: any };
export type ItemProps<T> = Omit<T, keyof ContextMenuProp> & { uid: string; [key: string]: any };

export interface ItemContainerBaseProps<T> {
    itemIdsGetter: () => string[];
    itemPropsGetter: (uid: string[]) => ItemProps<T>[];
    contextMenuActionsHandler?: contextMenuActionsArguments<void, T>;
    contextMenuActions?: PayloadItemProps[][];
    contextMenuActionsVisibilityCallback?: contextMenuActionsArguments<boolean, T>;
    canHide?: boolean;
    canShuffle?: boolean;
    canSelect?: boolean;

    Item: FunctionComponent<T>;
    checkboxResizeConfig?: ResizeConfig<CheckboxResizeConfig>;
    isSelectableKey?: string;
    disableClickOnSelection?: boolean;
    style?: object;
    className?: string;
    emptyView?: FunctionComponent<CollectionEmptyViewProps>;
    itemContextMenuEmptyText?: string;
    containerContextMenuEmptyText?: string;
}

export interface CollectionEmptyViewProps {
    containerData: ContainerState;
    showItems: () => void;
}

export type contextMenuActionsArguments<T, K> = (
    actionId: string,
    targetId: string,
    targetState: ItemState,
    containerState: ContainerState,
    itemData?: ItemProps<K> | string[]
) => T;

export interface ItemContainerProps<T> extends ItemContainerBaseProps<T> {
    from: number;
    to: number;
    scrollContainerClass?: string;
    scrollRef?: React.RefObject<HTMLDivElement>;
    onScrollCapture?: () => void;
    children?: JSX.Element;
}

export type GridItemProps<T extends {}> = T & ContextMenuProp;

interface ContextMenuProp {
    contextMenuHandler?: (event: MouseEvent<HTMLElement>) => void;
}

export interface ItemWithContextHandlerProps<T> {
    itemUid: string;
    Item: FunctionComponent<T>;
    itemProps: Omit<object, keyof ContextMenuProp>;
    contextMenuOpener: (e: React.MouseEvent, itemId: string) => void;
}

export interface DefaultOptionsConfig {
    canSelect?: boolean;
    canShuffle?: boolean;
    canHide?: boolean;
}

export interface ItemsState {
    [key: string]: ItemState;
}

export interface ItemState {
    isVisible?: boolean;
    isSelected?: boolean;
}

export interface ContainerState {
    selectionMode: boolean;
    withHiddenItems: boolean;
}
