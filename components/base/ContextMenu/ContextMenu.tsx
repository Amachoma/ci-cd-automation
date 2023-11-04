import React from "react";
import { MouseEvent, SyntheticEvent, useRef, useState, useEffect } from "react";
import { animated as a, useTransition } from "@react-spring/web";
import { animConfigs } from "@/consts/consts";
// import { contextMenuIconLibrary } from "icons/icons";
import useMediaQuery from "@/hooks/mediaQuery/useMediaQuery";

import { Item } from "./Item/Item";
import { getContextBoundingBox, getPosition, getWindowDelta } from "./contextMenuHelpers";
import { ContextMenuProps, ContextState, POINTER_EVENT_TYPES } from "./interfaces";
import "./ContextMenu.scss";
import { includeIcons } from "@/icons/icons";

const misclickHandler = (e: SyntheticEvent) => {
    const isMiss = e.currentTarget === e.target;
    if (isMiss) {
        e.preventDefault();
        // e.stopPropagation();
    }
};

const CURSOR_OFFSET = 150;
const ANIMATION_CONFIG = {
    default: {
        transition: { from: "scale(0)", to: "scale(1)" },
        interpolation: animConfigs.contextMenu,
        withBg: false,
    },
    720: {
        transition: { from: "translateY(100%)", to: "translateY(0%)" },
        interpolation: animConfigs.default,
        withBg: true,
    },
};

// TODO: optimization (ex. item calculation on same data and type)
export default function ContextMenu({
    isVisible,
    x,
    y,
    items,
    itemId,
    closeHandler,
    itemClickHandler,
}: ContextMenuProps) {
    const animationConfig = useMediaQuery(ANIMATION_CONFIG);
    const menuRect = useRef<HTMLDivElement>(null);
    const [contextState, setContextState] = useState<ContextState>({
        pos: { x, y },
        dimensions: { width: 0, height: 0 },
        rect: { top: 0, bottom: 0, left: 0, right: 0 },
        pivot: "",
    });
    const ANIMATION_PROPERTY = animationConfig.transition;
    const transition = useTransition(isVisible, {
        from: { opacity: 0, transform: ANIMATION_PROPERTY.from, pointerEvents: POINTER_EVENT_TYPES.AUTO },
        enter: { opacity: 1, transform: ANIMATION_PROPERTY.to, pointerEvents: POINTER_EVENT_TYPES.AUTO },
        leave: { opacity: 0, transform: ANIMATION_PROPERTY.from, pointerEvents: POINTER_EVENT_TYPES.NONE },
        config: animationConfig.interpolation,
    });

    useEffect(() => {
        const icons: string[] = [];
        items.forEach((group) => {
            group.forEach((item) => {
                if (item.icon) {
                    icons.push(item.icon);
                }
            });
        });

        includeIcons(icons);
    }, [items]);

    useEffect(() => {
        if (menuRect.current) {
            const width = menuRect.current.offsetWidth;
            const height = menuRect.current.offsetHeight;
            const pos = getPosition({ width, height, x, y });
            const boundingBox = getContextBoundingBox(pos.x, pos.y, width, height);
            setContextState({
                pos: { x: pos.x, y: pos.y },
                dimensions: { width, height },
                rect: {
                    left: boundingBox.left,
                    right: boundingBox.right,
                    top: boundingBox.top,
                    bottom: boundingBox.bottom,
                },
                pivot: pos.pivot,
            });
        }
    }, [isVisible, x, y]);

    function calculateWindowDelta(e: MouseEvent<HTMLElement>) {
        if (!animationConfig.withBg) {
            const { top, right, bottom, left } = contextState.rect;
            const config = getWindowDelta({ x: e.clientX, y: e.clientY }, { top, right, bottom, left });

            if (Math.max(config.xDelta, config.yDelta) >= CURSOR_OFFSET) {
                closeHandler();
            }
        }
    }

    return transition(
        (transitionStyles, isVisible) =>
            isVisible && (
                <>
                    <a.div
                        className="contextMenu-darken"
                        data-testid="context-menu-darken"
                        style={{
                            opacity: animationConfig.withBg ? transitionStyles.opacity : 0,
                            pointerEvents: transitionStyles.pointerEvents,
                        }}
                        onMouseMove={calculateWindowDelta}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            closeHandler();
                        }}
                        onClick={closeHandler}
                    />
                    {/*<a.section*/}
                    {/*    style={{ pointerEvents: transitionStyles.pointerEvents }}*/}
                    {/*    className="contextMenu-container"*/}
                    {/*    data-testid="context-menu-container"*/}
                    {/*    onClick={closeHandler}*/}
                    {/*    onContextMenu={(e) => {*/}
                    {/*        e.preventDefault();*/}
                    {/*        closeHandler();*/}
                    {/*    }}*/}
                    {/*    onMouseMove={calculateWindowDelta}*/}
                    {/*>*/}
                    <a.div
                        className="contextMenu"
                        data-testid="context-menu"
                        style={{
                            left: contextState.pos.x,
                            top: contextState.pos.y,
                            transformOrigin: contextState.pivot,
                            ...transitionStyles,
                        }}
                        ref={menuRect}
                        onContextMenu={misclickHandler}
                        onClick={misclickHandler}
                    >
                        {items.map((group, idx) => (
                            <section
                                className="contextMenu__group"
                                key={idx}
                                onContextMenu={misclickHandler}
                                onClick={misclickHandler}
                                data-testid="context-items-section"
                            >
                                {group.map((item) => (
                                    <Item
                                        key={item.id}
                                        text={item.text}
                                        textColor={item.textColor}
                                        // Icon={contextMenuIconLibrary[item.icon]}
                                        icon={item.icon}
                                        iconColor={item.iconColor}
                                        clickHandler={() => {
                                            itemClickHandler(item.id, itemId);
                                        }}
                                    />
                                ))}
                            </section>
                        ))}
                    </a.div>
                    {/*</a.section>*/}
                </>
            )
    );
}
