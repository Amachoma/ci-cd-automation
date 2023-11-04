"use client";

import React from "react";
import { animated } from "@react-spring/web";
import useMediaQuery from "@/hooks/mediaQuery/useMediaQuery";
import { CheckboxProps, CheckboxResizeConfig } from "@/components/base/RoundCheckbox/interfaces";

import "./RoundCheckbox.scss";

const DEFAULT_SIZE = 40;
const DEFAULT_POSITION = { left: -10, top: -10 };

export default function RoundCheckbox({
    size = DEFAULT_SIZE,
    position = DEFAULT_POSITION,
    style,
    checked,
    onClick,
    resizeConfig,
}: CheckboxProps) {
    const resConfig = resizeConfig || { default: { size, ...position } };
    const config = useMediaQuery<CheckboxResizeConfig>(resConfig);
    const widthStyle = { "--checkbox-size": `${config.size}px` } as React.CSSProperties;

    return (
        <animated.button
            className={`controls-checkbox ${checked ? "controls-checkbox_checked" : ""}`}
            style={{
                ...style,
                ...widthStyle,
                left: config.left,
                top: config.top,
                right: config.right,
                bottom: config.bottom,
            }}
            onClick={onClick}
            role="checkbox"
        >
            <div className="controls-checkbox__background" />
            <div className="controls-checkbox__tick-mark" />
        </animated.button>
    );
}
