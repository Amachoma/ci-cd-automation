import Link from "next/link";
import React from "react";
// import { useTranslation } from "react-i18next";

import { BaseProps, EmptyViewProps, EMPTY_VIEW_TEXT_TYPES } from "./interfaces";
import "./EmptyView.scss";

export default function EmptyView({ icon, message }: EmptyViewProps) {
    // const { t } = useTranslation();
    const t = (arg: string) => arg;

    function processText(payload: BaseProps[]) {
        const resultMarkup: JSX.Element[] = [];
        let currentContainer: JSX.Element[] = [];
        payload.forEach((obj, idx) => {
            switch (obj.type) {
                case EMPTY_VIEW_TEXT_TYPES.TEXT:
                    currentContainer.push(<span key={idx}>{obj.label && t(obj.label)}</span>);
                    break;
                case EMPTY_VIEW_TEXT_TYPES.BUTTON:
                    currentContainer.push(
                        <span key={idx} className="ew-button" onClick={obj.onClick}>
                            {obj.label && t(obj.label)}
                        </span>
                    );
                    break;
                case EMPTY_VIEW_TEXT_TYPES.LINK:
                    currentContainer.push(
                        <Link key={idx} className="ew-link" href={obj.href || ""}>
                            {obj.label && t(obj.label)}
                        </Link>
                    );
                    break;
                case EMPTY_VIEW_TEXT_TYPES.BREAK:
                    resultMarkup.push(<div key={idx}>{currentContainer}</div>);
                    currentContainer = [];
                    break;
            }
        });
        if (currentContainer.length) {
            resultMarkup.push(<div key={currentContainer.toString()}>{currentContainer}</div>);
            currentContainer = [];
        }

        return <>{resultMarkup}</>;
    }

    return (
        <div className="ew-container" style={{ padding: 20 }}>
            {/*TODO: fix cloneElement*/}
            {icon && React.cloneElement(icon, { className: `ew-icon ${icon.props.className}` })}
            <div className="ew-message">{processText(message)}</div>
        </div>
    );
}
