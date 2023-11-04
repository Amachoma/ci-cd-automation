import { Rect } from "@/utils/interfaces";
import { ResizeConfig } from "@/hooks/mediaQuery/interfaces";

export interface CheckboxResizeConfig {
    size: number;
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
}

export interface CheckboxProps {
    size?: number;
    position?: Partial<Rect>;
    onClick?: () => void;
    checked?: boolean;
    style?: object;
    resizeConfig?: ResizeConfig<CheckboxResizeConfig>;
}
