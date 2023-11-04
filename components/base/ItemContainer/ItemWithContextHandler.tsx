import React, { useCallback } from "react";

import { ItemWithContextHandlerProps } from "./interfaces";

function ItemWithContext<T>({ itemUid, contextMenuOpener, Item, itemProps }: ItemWithContextHandlerProps<T>) {
    const contextCallback = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            contextMenuOpener(event, itemUid);
        },
        [itemUid, contextMenuOpener]
    );
    const props = {
        ...itemProps,
        contextMenuHandler: contextCallback,
    } as any;
    return <Item {...props} />;
}

export const ItemWithContextHandler = React.memo(
    ItemWithContext,
    (prev, next) => prev.itemUid === next.itemUid && prev.itemProps === next.itemProps
) as typeof ItemWithContext;
