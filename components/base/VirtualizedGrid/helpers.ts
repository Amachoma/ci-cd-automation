import { getFullPaddingConfig, orZero } from "@/utils/utils";

import { GridItemResizeConfig, OffsetConfig, GridConfig } from "./interfaces";
import { Padding } from "@/utils/interfaces";

function calculateOffsetConfig({
    containerHeight,
    itemHeight,
    padding,
    columns,
    gridGap,
    itemCount,
    tolerance,
    scrollTop,
}: GridConfig): OffsetConfig {
    const rowHeight = itemHeight + gridGap;
    const totalRowsCount = Math.ceil(itemCount / columns);

    const upperAvailableSpace = Math.max(scrollTop - padding.top, 0);
    const offscreenUpperRowsCount = Math.floor(upperAvailableSpace / rowHeight);

    let rowsToRender = Math.floor(containerHeight / rowHeight) + 1;
    //If the number of visible rows is integer, as well as the number of off-screen rows, then we do not need an additional (cropped) row
    if (containerHeight % rowHeight === 0 && upperAvailableSpace % rowHeight === 0) {
        rowsToRender -= 1;
    }
    const renderFromRow = Math.max(0, offscreenUpperRowsCount - tolerance);
    const renderToRow = Math.min(totalRowsCount, offscreenUpperRowsCount + rowsToRender + tolerance);

    const renderFromItem = renderFromRow * columns;
    const renderToItem = Math.min(itemCount, renderToRow * columns);

    const paddingTop = renderFromRow * rowHeight + padding.top;
    const paddingBottom = (totalRowsCount - renderToRow) * rowHeight + padding.bottom;

    return { from: renderFromItem, to: renderToItem, paddingTop, paddingBottom };
}

export function getOffsets(
    containerHeight: number,
    resizeConfig: GridItemResizeConfig,
    itemHeight: number,
    padding: Required<Padding>,
    itemCount: number,
    tolerance = 0,
    scrollTop = 0
) {
    const { columns, gridGap: gap } = resizeConfig;
    const gridGap = orZero(gap);
    return calculateOffsetConfig({
        containerHeight,
        itemHeight,
        padding,
        gridGap,
        itemCount,
        columns,
        tolerance,
        scrollTop,
    });
}

export function getColumnConfig(
    width: number,
    resizeConfig: GridItemResizeConfig,
    rowHeight?: number,
    aspectRatio?: number
) {
    const { columns, gridGap: gap, padding } = resizeConfig;
    const [paddingConfig, gridGap] = [getFullPaddingConfig(padding), orZero(gap)];

    const itemWidth = (width - (paddingConfig.left + paddingConfig.right) - (columns - 1) * gridGap) / columns;
    const itemHeight = rowHeight ? rowHeight : aspectRatio ? itemWidth / aspectRatio : itemWidth;

    // TODO: height auto (if needed, idk)
    const gridTemplateColumns = `repeat(${columns}, ${itemWidth}px)`;
    const gridAutoRows = itemHeight ? `${itemHeight}px` : undefined;

    return { itemWidth, itemHeight, gridTemplateColumns, gridAutoRows };
}
