import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "@react-spring/web";
import { shuffle } from "@/utils/utils";
import DeviceScrollbar from "@/components/DeviceScrollbar/DeviceScrollbar";
import RoundCheckbox from "@/components/base/RoundCheckbox/RoundCheckbox";
import useContextMenu from "@/components/base/ContextMenu/useContextMenu";
import ContextMenu from "@/components/base/ContextMenu/ContextMenu";
import useHydration from "@/hooks/hydration/useHydration";

import { ContainerState, DefaultOptionsConfig, ItemContainerProps, ItemProps, ItemsState } from "./interfaces";
import { contextMenuItemsGetter } from "./helpers";
import { CONTAINER_TARGET_UID } from "./consts";
import "./ItemContainer.scss";
import { ItemWithContextHandler } from "./ItemWithContextHandler";
import { Toast } from "@/utils/promise";

export default React.memo(ItemContainer) as typeof ItemContainer;

type ScrollDirection = "top" | "bottom" | "initial";

interface ScrollStateRef {
    prevValue: number;
    scrollDirection: ScrollDirection;
    timestamp: number;
}

interface ItemScrollDirection {
    [key: string]: ScrollDirection;
}

const TIMESTAMP_DELTA = 100;

// TODO: rename: disableClickOnSelection -> preventClickOnSelection
function ItemContainer<T>({
    itemIdsGetter,
    itemPropsGetter,
    from,
    to,
    scrollContainerClass,
    scrollRef,
    onScrollCapture,
    contextMenuActions,
    contextMenuActionsHandler,
    contextMenuActionsVisibilityCallback,
    canHide,
    canSelect,
    canShuffle,
    Item,
    style,
    className,
    checkboxResizeConfig,
    isSelectableKey,
    disableClickOnSelection,
    emptyView,
    children,
    itemContextMenuEmptyText = "no actions available for the selected element",
    containerContextMenuEmptyText = "no common actions available for the items",
}: ItemContainerProps<T>) {
    const itemIds = itemIdsGetter();
    const isHydrated = useHydration();
    const { contextState, showContextMenu, closeContextMenu } = useContextMenu();
    const [itemsOrder, setItemsOrder] = useState(itemIds);
    const [itemsState, setItemsState] = useState<ItemsState>(
        Object.fromEntries(itemIds.map((id) => [id, { isVisible: true }]))
    );
    const scrollDirectionRef = useRef<ScrollStateRef>({
        prevValue: 0,
        scrollDirection: "initial",
        timestamp: Date.now(),
    });
    const itemsScrollDirectionRef = useRef<ItemScrollDirection>({});
    const contextMenuPortalTarget = useRef<HTMLElement | null>(null);
    // const contextMenuTarget = useRef<string>("");

    const [containerState, setContainerState] = useState<ContainerState>({
        selectionMode: false,
        withHiddenItems: false,
    });
    const transition = useTransition(containerState.selectionMode, {
        from: { transform: "scale(0)" },
        enter: { transform: "scale(1)" },
        leave: { transform: "scale(0)" },
    });

    useEffect(() => {
        contextMenuPortalTarget.current = document.body;
    }, []);

    function onScrollCaptureHandler() {
        if (scrollRef && scrollRef.current) {
            scrollDirectionRef.current = {
                scrollDirection: scrollRef.current.scrollTop > scrollDirectionRef.current.prevValue ? "bottom" : "top",
                prevValue: scrollRef.current.scrollTop,
                timestamp: Date.now(),
            };
        }
        onScrollCapture && onScrollCapture();
    }

    // TODO: reduce needless re-renders
    // TODO: THINK THIS SYSTEM OUT: MB CACHE?
    // useEffect(() => {
    //     setItemsOrder(itemIds);
    //     const nextItemState: ItemsState = Object.fromEntries(
    //         itemIds.map((id) => {
    //             if (id in itemsState) {
    //                 return [id, { isVisible: itemsState[id].isVisible, isSelected: itemsState[id].isSelected }];
    //             } else {
    //                 return [id, { isVisible: true }];
    //             }
    //         })
    //     );
    //     setItemsState(nextItemState);
    // }, [itemIds]);

    // useEffect(() => {
    //     addEventListener(`${uid}:onContextMenu`, contextMenuToggleHandler);
    //     addEventListener(`${uid}:contextMenuClick`, contextMenuBaseClickHandler);
    //
    //     return () => {
    //         removeEventListener(`${uid}:onContextMenu`, contextMenuToggleHandler);
    //         removeEventListener(`${uid}:contextMenuClick`, contextMenuBaseClickHandler);
    //     };
    // });

    // TODO: CONTEXT TOGGLE HANDLER!
    // function contextMenuToggleHandler(e: Event) {
    //     const { x, y, targetId, itemData } = (e as CustomEvent).detail;
    //     const defaultItemsConfig: DefaultOptionsConfig = {
    //         canHide,
    //         canShuffle,
    //         canSelect: canSelect,
    //     };
    //     const itemRecord = containerState.selectionMode
    //         ? Object.keys(itemsState).filter((id) => itemsState[id].isSelected)
    //         : itemData;
    //     const items = contextMenuItemsGetter(
    //         targetId,
    //         itemsState[targetId],
    //         containerState,
    //         defaultItemsConfig,
    //         contextMenuActions,
    //         itemRecord,
    //         contextMenuActionsVisibilityCallback
    //     );
    //     const emptyContextMenuActions = items.length === 1 && items[0].length === 1 && items[0][0].id === "select";
    //     emptyContextMenuActions
    //         ? // ? new Toast().info(emptyContextMenuText)
    //           alert("You can't edit this item")
    //         : contextMenuOpener(x, y, targetId, uid, items);
    // }

    // TODO: BASE CLICK HANDLER
    // function contextMenuBaseClickHandler(e: Event) {
    //     const { id, targetId } = (e as CustomEvent).detail;
    //     const itemData = containerState.selectionMode
    //         ? Object.keys(itemsState).filter((id) => itemsState[id].isSelected)
    //         : childProps.find((element) => element.uid === targetId);
    //     if (contextMenuActionsHandler) {
    //         contextMenuActionsHandler(id, targetId, itemsState[targetId], containerState, itemData);
    //     }
    //     switch (id) {
    //         case "select":
    //             const targetProps = childProps.find((target) => target.uid === targetId);
    //             if (
    //                 targetId !== CONTAINER_TARGET_UID &&
    //                 (!isSelectableKey || (isSelectableKey && targetProps && targetProps[isSelectableKey]))
    //             ) {
    //                 checkboxClickHandler(targetId);
    //             }
    //             setContainerState({ ...containerState, selectionMode: true });
    //             break;
    //         case "unselect":
    //             const newItems = Object.keys(itemsState).reduce(
    //                 (attrs, key) => ({ ...attrs, [key]: { ...itemsState[key], isSelected: false } }),
    //                 {}
    //             );
    //             setItemsState(newItems);
    //             setContainerState({ ...containerState, selectionMode: false });
    //             break;
    //         case "shuffle":
    //             setItemsOrder(shuffle(itemsOrder));
    //             break;
    //         case "hide":
    //             const item = itemsState[targetId];
    //             setItemsState({ ...itemsState, [targetId]: { ...item, isVisible: false } });
    //             setContainerState({ ...containerState, withHiddenItems: true });
    //             break;
    //         case "show":
    //             showItems();
    //             break;
    //     }
    // }

    function showItems() {
        const newState = Object.fromEntries(itemsOrder.map((id) => [id, { ...itemsState[id], isVisible: true }]));
        setItemsState(newState);
        setContainerState({ ...containerState, withHiddenItems: false });
    }

    function checkboxClickHandler(itemId: string) {
        const item = itemsState[itemId];
        setItemsState({ ...itemsState, [itemId]: { ...item, isSelected: !item.isSelected } });
    }

    function containerContextMenuToggle(event: React.MouseEvent) {
        event.preventDefault();
        if (event.target === event.currentTarget) {
            itemContextMenuHandler(event, CONTAINER_TARGET_UID);
            // triggerEvent(`${uid}:onContextMenu`, {
            //     targetId: CONTAINER_TARGET_UID,
            //     x: event.clientX,
            //     y: event.pageY,
            // });
        }
    }

    function itemContextMenuHandler(e: React.MouseEvent, itemId: string) {
        const defaultItemsConfig: DefaultOptionsConfig = {
            canHide,
            canShuffle,
            canSelect: canSelect,
        };
        const itemData = childProps.find((child) => child.uid === itemId) as ItemProps<T>;
        //itemPropsGetter([targetId])[0]

        const itemRecord = containerState.selectionMode
            ? Object.keys(itemsState).filter((id) => itemsState[id].isSelected)
            : itemData;

        const items = contextMenuItemsGetter(
            itemId,
            itemsState[itemId],
            containerState,
            defaultItemsConfig,
            contextMenuActions,
            itemRecord,
            contextMenuActionsVisibilityCallback
        );
        // const onlySelectAction = items.length === 1 && items[0].length === 1 && items[0][0].id === "select";
        // || onlySelectAction
        const emptyContextMenuActions = items.length === 0;
        if (emptyContextMenuActions) {
            new Toast().info(
                itemId === CONTAINER_TARGET_UID ? containerContextMenuEmptyText : itemContextMenuEmptyText
            );
        } else {
            showContextMenu(e, itemId, items);
        }
    }

    function contextItemClickHandler(actionId: string, itemId: string) {
        const itemData = containerState.selectionMode
            ? Object.keys(itemsState).filter((id) => itemsState[id].isSelected)
            : childProps.find((element) => element.uid === itemId);

        if (contextMenuActionsHandler) {
            contextMenuActionsHandler(actionId, itemId, itemsState[itemId], containerState, itemData);
        }

        switch (actionId) {
            case "select":
                const targetProps = childProps.find((target) => target.uid === itemId);
                if (
                    itemId !== CONTAINER_TARGET_UID &&
                    (!isSelectableKey || (isSelectableKey && targetProps && targetProps[isSelectableKey]))
                ) {
                    checkboxClickHandler(itemId);
                }
                setContainerState({ ...containerState, selectionMode: true });
                break;
            case "unselect":
                const newItems = Object.keys(itemsState).reduce(
                    (attrs, key) => ({ ...attrs, [key]: { ...itemsState[key], isSelected: false } }),
                    {}
                );
                setItemsState(newItems);
                setContainerState({ ...containerState, selectionMode: false });
                break;
            case "shuffle":
                setItemsOrder(shuffle(itemsOrder));
                break;
            case "hide":
                const item = itemsState[itemId];
                setItemsState({ ...itemsState, [itemId]: { ...item, isVisible: false } });
                setContainerState({ ...containerState, withHiddenItems: true });
                break;
            case "show":
                showItems();
                break;
        }
        closeContextMenu();
    }

    // Slice not considering last item (this works as intended now)
    const idsToDisplay = itemsOrder.filter((id) => itemsState[id].isVisible).slice(from, to);

    const [intersectingKeys, newKeys]: string[][] = [[], []];
    idsToDisplay.forEach((id) => {
        Object.keys(itemsScrollDirectionRef.current).includes(id) ? intersectingKeys.push(id) : newKeys.push(id);
    });
    itemsScrollDirectionRef.current = Object.fromEntries([
        ...intersectingKeys.map((key) => [key, itemsScrollDirectionRef.current[key]]),
        ...newKeys.map((key) => [
            key,
            Date.now() - scrollDirectionRef.current.timestamp <= TIMESTAMP_DELTA
                ? scrollDirectionRef.current.scrollDirection
                : "initial",
        ]),
    ]);

    const childProps = itemPropsGetter(idsToDisplay);

    return childProps.length ? (
        <>
            {contextMenuPortalTarget.current &&
                createPortal(
                    <ContextMenu
                        isVisible={contextState.isVisible}
                        x={contextState.pos.x}
                        y={contextState.pos.y}
                        items={contextState.items}
                        itemId={contextState.opener}
                        closeHandler={closeContextMenu}
                        itemClickHandler={contextItemClickHandler}
                    />,
                    contextMenuPortalTarget.current
                )}
            <DeviceScrollbar
                className={scrollContainerClass || ""}
                scrollRef={scrollRef}
                onScrollCapture={onScrollCaptureHandler}
            >
                <div
                    className={className}
                    style={style}
                    data-testid="controls-item-container"
                    onContextMenu={containerContextMenuToggle}
                >
                    {childProps.map((propsConfig, idx) => {
                        const itemCanBeSelected = isSelectableKey ? propsConfig[isSelectableKey] : true;
                        const styleVariables = { "--itemIndex": `${idx * 50}ms` } as React.CSSProperties;
                        return (
                            <div
                                key={propsConfig.uid}
                                style={styleVariables}
                                className={`container__item container__item_${
                                    isHydrated ? itemsScrollDirectionRef.current[propsConfig.uid] : "hidden"
                                }`}
                            >
                                <ItemWithContextHandler
                                    Item={Item}
                                    itemUid={propsConfig.uid}
                                    contextMenuOpener={itemContextMenuHandler}
                                    itemProps={propsConfig}
                                    // containerUid={uid}
                                />
                                {disableClickOnSelection && containerState.selectionMode && (
                                    <div
                                        className="container__item_overlay"
                                        onClick={
                                            itemCanBeSelected ? () => checkboxClickHandler(propsConfig.uid) : undefined
                                        }
                                        onContextMenu={containerContextMenuToggle}
                                    />
                                )}
                                {transition((style, checked) =>
                                    checked && itemCanBeSelected ? (
                                        <RoundCheckbox
                                            resizeConfig={checkboxResizeConfig}
                                            style={style}
                                            checked={itemsState[propsConfig.uid].isSelected}
                                            onClick={() => checkboxClickHandler(propsConfig.uid)}
                                        />
                                    ) : null
                                )}
                            </div>
                        );
                    })}
                </div>
                {children}
            </DeviceScrollbar>
        </>
    ) : (
        (emptyView && emptyView({ containerData: containerState, showItems: showItems })) || <></>
    );
}
