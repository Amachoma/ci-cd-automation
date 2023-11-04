import { ResizeConfig } from "@/hooks/mediaQuery/interfaces";
import { ItemContainerBaseProps } from "@/components/base/ItemContainer/interfaces";
import { Padding } from "@/utils/interfaces";

export interface GridItemResizeConfig {
    columns: number;
    aspectRatio: number;
    gridGap?: number;
    padding?: Padding;
}

export interface RectDimensions {
    width: number;
    height: number;
}

export interface VirtualizedGridProps<T> extends ItemContainerBaseProps<T> {
    itemResizeConfig: ResizeConfig<GridItemResizeConfig>;
    tolerance?: number;
    rowHeight?: number;
}

export interface OffsetConfig {
    from: number;
    to: number;
    paddingTop: number;
    paddingBottom: number;
}

export interface GridConfig {
    itemHeight: number;
    gridGap: number;
    containerHeight: number;
    padding: Required<Padding>;
    itemCount: number;
    columns: number;
    tolerance: number;
    scrollTop: number;
}
