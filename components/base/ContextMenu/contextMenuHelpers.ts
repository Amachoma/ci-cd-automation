import { Position2D, Rect } from "@/utils/interfaces";

interface PositionProps {
    width: number;
    height: number;
    x: number;
    y: number;
}

export function getPosition({ width, height, x, y }: PositionProps) {
    const PADDING = 5;
    const [rightDelta, leftDelta] = [
        Math.max(0, x + width - (window.innerWidth - PADDING)),
        Math.max(0, (x - width - PADDING) * -1),
    ];
    const [topDelta, bottomDelta] = [
        Math.min(0, y - height - PADDING),
        Math.min(0, -(y + height - (window.innerHeight - PADDING))),
    ];
    const towardsRight = rightDelta <= leftDelta;
    const towardsBottom = bottomDelta === 0 || bottomDelta >= topDelta;
    const xPos = towardsRight ? x - rightDelta : x - width + leftDelta;
    const yPos = towardsBottom ? y + bottomDelta : y - height - topDelta;
    return { x: xPos, y: yPos, pivot: `${towardsBottom ? "top" : "bottom"} ${towardsRight ? "left" : "right"}` };
}

export function getContextBoundingBox(x: number, y: number, width: number, height: number) {
    return {
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
    };
}

export function getWindowDelta(clickPosition: Position2D, rect: Rect) {
    const config = { xDelta: 0, yDelta: 0 };
    if (clickPosition.x < rect.left) config.xDelta = rect.left - clickPosition.x;
    else if (clickPosition.x > rect.right) config.xDelta = clickPosition.x - rect.right;

    if (clickPosition.y < rect.top) config.yDelta = rect.top - clickPosition.y;
    else if (clickPosition.y > rect.bottom) config.yDelta = clickPosition.y - rect.bottom;
    return config;
}
