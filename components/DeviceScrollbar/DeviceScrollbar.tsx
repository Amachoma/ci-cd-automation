// import { isMobile } from "react-device-detect";
import { ReactNode } from "react";
import SimpleBar from "simplebar-react";
import React from "react";
import "simplebar-react/dist/simplebar.min.css";

interface DeviceScrollbarProps {
    className?: string;
    children: ReactNode;
    scrollRef?: React.RefObject<HTMLDivElement>;
    onScrollCapture?: () => void;
    style?: object;
    autoHide?: boolean;
    tabIndex?: number;
}

export default function DeviceScrollbar({
    children,
    className,
    onScrollCapture,
    scrollRef,
    style,
    autoHide,
    tabIndex,
}: DeviceScrollbarProps) {
    return (
        <SimpleBar
            className={className}
            scrollableNodeProps={{ ref: scrollRef }}
            onScrollCapture={onScrollCapture}
            style={{ ...style }}
            autoHide={autoHide || false}
            tabIndex={tabIndex}
        >
            {children}
        </SimpleBar>
    );
}

// isMobile
// ? (
//     <div className={className} ref={scrollRef} onScrollCapture={onScrollCapture} style={{ ...style }}
//          tabIndex={tabIndex}>
//         {children}
//     </div>
// ) :
