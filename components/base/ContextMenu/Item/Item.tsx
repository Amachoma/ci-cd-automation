import React from "react";
import { ItemProps } from "../interfaces";
// import { useTranslation } from "react-i18next";

export function Item({ text, textColor, icon, iconColor, clickHandler }: ItemProps) {
    // const { t } = useTranslation();
    const t = (arg: any) => arg;

    return (
        <button
            className="context-item contextMenu__context-item"
            onClick={clickHandler}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/*<Icon className="context-item__icon" style={{ fill: iconColor }} />*/}
            {icon && <div className={`context-icon ${icon}-icon`} />}
            <h4 className="context-item__text" style={{ color: textColor }}>
                {t(text)}
            </h4>
        </button>
    );
}
