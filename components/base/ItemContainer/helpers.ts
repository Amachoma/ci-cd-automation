import { PayloadItemProps } from "@/components/base/ContextMenu/interfaces";
// import store from "redux/store";
// import { activateContextMenu } from "redux/applicationSlice";

import { ContainerState, contextMenuActionsArguments, DefaultOptionsConfig, ItemProps, ItemState } from "./interfaces";
import { CONTAINER_TARGET_UID, HIDE_ITEM, SELECT_ITEM, SHOW_ITEM, SHUFFLE_ITEM, UNSELECT_ALL } from "./consts";

export function getItemDataType(itemData: any) {
    if (typeof itemData === "object") {
        if ("length" in itemData) {
            return "array";
        } else {
            return "dictionary";
        }
    } else return "undefined";
}

export function getDefaultContextItems(
    { canSelect, canHide, canShuffle }: DefaultOptionsConfig,
    contextMenuActions?: PayloadItemProps[][],
    contextMenuActionsVisibilityCallback?: contextMenuActionsArguments<boolean, any>
) {
    const items = [];
    if (canShuffle) items.push(SHUFFLE_ITEM);
    if (canSelect) {
        const selectionModeItems = contextMenuItemsFilter(
            contextMenuActions,
            "",
            { isSelected: true, isVisible: true },
            { selectionMode: true, withHiddenItems: false },
            [""],
            contextMenuActionsVisibilityCallback
        );
        selectionModeItems.length > 0 && items.push(SELECT_ITEM, UNSELECT_ALL);
    }
    if (canHide) items.push(HIDE_ITEM, SHOW_ITEM);
    return items;
}

export function contextMenuBaseVisibilityCallback(
    actionId: string,
    targetId: string,
    targetState: ItemState,
    containerState: ContainerState
): boolean {
    switch (actionId) {
        case "hide":
            return targetId !== CONTAINER_TARGET_UID && !containerState.selectionMode;
        case "show":
            return targetId === CONTAINER_TARGET_UID && containerState.withHiddenItems;
        case "shuffle":
            return targetId === CONTAINER_TARGET_UID;
        case "select":
            return !containerState.selectionMode;
        case "unselect":
            return containerState.selectionMode;
        default:
            return false;
    }
}

function contextMenuItemsFilter<T>(
    contextMenuActions: PayloadItemProps[][] | undefined,
    targetId: string,
    targetState: ItemState,
    containerState: ContainerState,
    itemData: ItemProps<T> | string[],
    contextMenuActionsVisibilityCallback?: contextMenuActionsArguments<boolean, any>
) {
    if (contextMenuActions && contextMenuActionsVisibilityCallback) {
        return contextMenuActions
            .map((itemGroup) =>
                itemGroup.filter((item) =>
                    contextMenuActionsVisibilityCallback(item.id, targetId, targetState, containerState, itemData)
                )
            )
            .filter((group) => group.length);
    } else return [];
}

export function contextMenuItemsGetter<T>(
    targetId: string,
    targetState: ItemState,
    containerState: ContainerState,
    defaultItemsConfig: DefaultOptionsConfig,
    contextMenuActions: PayloadItemProps[][] | undefined,
    itemData: ItemProps<T> | string[],
    contextMenuActionsVisibilityCallback?: contextMenuActionsArguments<boolean, any>
) {
    const items = [];
    if (contextMenuActions && contextMenuActionsVisibilityCallback) {
        const actionItems = contextMenuItemsFilter(
            contextMenuActions,
            targetId,
            targetState,
            containerState,
            itemData,
            contextMenuActionsVisibilityCallback
        );
        if (actionItems.length) items.push(...actionItems);
    }
    const defaultContextItems = getDefaultContextItems(
        defaultItemsConfig,
        contextMenuActions,
        contextMenuActionsVisibilityCallback
    ).filter((item) => contextMenuBaseVisibilityCallback(item.id, targetId, targetState, containerState));
    if (defaultContextItems.length) items.push([...defaultContextItems]);
    return items;
}

// export function contextMenuOpener(
//     x: number,
//     y: number,
//     targetUid: string,
//     containerUid: string,
//     items: PayloadItemProps[][]
// ) {
//     store.dispatch(
//         activateContextMenu({
//             targetId: targetUid,
//             x,
//             y,
//             event: `${containerUid}:contextMenuClick`,
//             items,
//         })
//     );
// }
