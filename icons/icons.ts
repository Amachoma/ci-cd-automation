// TODO: to consts?
export enum CONTEXT_MENU_ICONS {
    cross = "cross",
    hide = "hide",
    show = "show",
    copyKanji = "copy-kanji",
    random = "random",
    select = "select",
    cancelSelection = "cancel-selection",
    dictionary = "dict",
    pencil = "pencil",
    pin = "pin-fill",
    unpin = "pin-border",
    user = "user-border",
    userAlt = "user-filled",
    plus = "plus",
    gear = "gear-border",
}

const iconsSet = new Set();
export function includeIcons(icons: string[]) {
    const existingStyles = document.head.querySelector("style");

    let styleElement;
    if (existingStyles) {
        styleElement = existingStyles;
    } else {
        styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
    }
    const styleSheet = styleElement.sheet as CSSStyleSheet;

    icons.forEach((iconName) => {
        const url = `url(/icons/base/${iconName}.svg)`;
        const className = `.${iconName}-icon`;

        if (iconsSet.has(className)) return;
        styleSheet.insertRule(
            `
        ${className} {
        mask: ${url} no-repeat center;
        mask-size: contain;
        -webkit-mask: ${url} no-repeat center;
        }
        `,
            styleSheet.cssRules.length
        );
        iconsSet.add(className);
    });
}
