import React, { useCallback, useEffect, useRef, useState } from "react";
import ItemContainer from "@/components/base/ItemContainer/ItemContainer";
import { getFullPaddingConfig, orZero } from "@/utils/utils";
import useMediaQuery from "@/hooks/mediaQuery/useMediaQuery";

import "./VirtualizedGrid.scss";
import { getColumnConfig, getOffsets } from "./helpers";
import { RectDimensions, VirtualizedGridProps } from "./interfaces";

function VirtualizedGrid<T>({
    rowHeight,
    Item,
    itemPropsGetter,
    contextMenuActions,
    contextMenuActionsVisibilityCallback,
    itemResizeConfig,
    tolerance = 1,
    itemIdsGetter,
    contextMenuActionsHandler,
    canHide,
    canSelect,
    canShuffle,
    checkboxResizeConfig,
    isSelectableKey,
    disableClickOnSelection,
    emptyView,
    itemContextMenuEmptyText,
    containerContextMenuEmptyText,
}: VirtualizedGridProps<T>) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<RectDimensions>({
        width: 0,
        height: 0,
    });
    const resizeConfig = useMediaQuery(itemResizeConfig);
    const { gridGap: gap, padding, aspectRatio } = resizeConfig;
    const itemIds = itemIdsGetter();

    // TODO: collection state
    const [scrollTop, setScrollTop] = useState(0);

    // TODO: reduce getCurrentConfig usages (one call per render)
    // const { gridGap: gap, padding, aspectRatio } = getCurrentConfig(itemResizeConfig);
    const [paddingConfig, gridGap] = [getFullPaddingConfig(padding), orZero(gap)];

    // Grid recalculation triggered by window resize event
    useEffect(() => {
        function updateContainerSize() {
            if (scrollContainerRef.current) {
                const width = scrollContainerRef.current.offsetWidth;
                const height = scrollContainerRef.current.offsetHeight;
                if (dimensions.width !== width || dimensions.height !== height) {
                    setDimensions({ width, height });
                }
            }
        }

        updateContainerSize();
        window.addEventListener("resize", updateContainerSize);
        return () => window.removeEventListener("resize", updateContainerSize);
    }, []);

    // No need to memoize columns config (not a heavy calculations)
    const { itemWidth, itemHeight, gridTemplateColumns, gridAutoRows } = getColumnConfig(
        dimensions.width,
        resizeConfig,
        rowHeight,
        aspectRatio
    );

    // No need to memoize display items range and vertical offsets (it's changes often)
    const { from, to, paddingTop, paddingBottom } = getOffsets(
        dimensions.height,
        resizeConfig,
        itemHeight,
        paddingConfig,
        itemIds.length,
        tolerance,
        scrollTop
    );

    const containerStyle = {
        paddingTop,
        paddingBottom,
        paddingLeft: paddingConfig.left,
        paddingRight: paddingConfig.right,
        gridTemplateColumns,
        gridAutoRows,
        gap: `${gridGap}px`,
        "--item-width": `${itemWidth}px`,
    };

    const memoizedScrollCapture = useCallback(() => {
        setScrollTop(scrollContainerRef.current?.scrollTop || 0);
    }, [scrollContainerRef]);

    // TODO: Measure performance
    return (
        <ItemContainer
            itemPropsGetter={itemPropsGetter}
            from={from}
            to={to}
            scrollContainerClass={`virtualized-grid`}
            scrollRef={scrollContainerRef}
            onScrollCapture={memoizedScrollCapture}
            contextMenuActions={contextMenuActions}
            contextMenuActionsHandler={contextMenuActionsHandler}
            contextMenuActionsVisibilityCallback={contextMenuActionsVisibilityCallback}
            canHide={canHide}
            canShuffle={canShuffle}
            canSelect={canSelect}
            Item={Item}
            itemIdsGetter={itemIdsGetter}
            style={containerStyle}
            className="virtualized-grid__item-container"
            checkboxResizeConfig={checkboxResizeConfig}
            isSelectableKey={isSelectableKey}
            disableClickOnSelection={disableClickOnSelection}
            emptyView={emptyView}
            containerContextMenuEmptyText={containerContextMenuEmptyText}
            itemContextMenuEmptyText={itemContextMenuEmptyText}
        />
    );
}

export default React.memo(
    VirtualizedGrid
    // (prevProps, nextProps) =>
    // JSON.stringify(prevProps.itemIds) === JSON.stringify(nextProps.itemIds) &&
    // prevProps.tolerance === nextProps.tolerance && prevProps.itemResizeConfig === nextProps.itemResizeConfig
) as typeof VirtualizedGrid;
