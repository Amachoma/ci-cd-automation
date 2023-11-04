import React, { useState } from "react";
// import { ContextState } from "@/components/base/ContextMenu/interfaces";
import { Position2D } from "@/utils/interfaces";
import { PayloadItemProps } from "@/components/base/ContextMenu/interfaces";

interface UseContextMenuState {
    pos: Position2D;
    isVisible: boolean;
    opener: string;
    items: PayloadItemProps[][];
}

export default function useContextMenu() {
    const [contextState, setContextState] = useState<UseContextMenuState>({
        pos: { x: 0, y: 0 },
        isVisible: false,
        opener: "",
        items: [],
    });

    function showContextMenu(e: React.MouseEvent, opener: string, items: PayloadItemProps[][]) {
        e.preventDefault();
        setContextState({ pos: { x: e.clientX, y: e.clientY }, opener, items, isVisible: true });
    }

    function closeContextMenu() {
        setContextState({
            pos: contextState.pos,
            opener: contextState.opener,
            items: contextState.items,
            isVisible: false,
        });
    }

    return { contextState, showContextMenu, closeContextMenu };
}
