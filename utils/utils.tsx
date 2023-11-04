// import { ModalPropsExtended } from "Components/Modal/ModalController";
// import { triggerEvent } from "@/utils/customEvents";
import { Padding } from "@/utils/interfaces";

export function shuffle(array: any[]) {
    const arrayCopy = [...array];

    let currentIndex = arrayCopy.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [arrayCopy[randomIndex], arrayCopy[currentIndex]];
    }
    return arrayCopy;
}

export function range(from: number, to: number) {
    const rang = [];
    for (let i = from; i < to; i++) {
        rang.push(i);
    }
    return rang;
}

export function pxToNumber(px: string) {
    return parseFloat(px.replace("px", ""));
}

export function FakeLoader<T>(responseTime: number, payload: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(payload), responseTime));
}

export function orZero(value: number | undefined | null): number {
    return value || 0;
}

export function getFullPaddingConfig(config: Padding | undefined): Required<Padding> {
    return {
        top: orZero(config?.top),
        right: orZero(config?.right),
        bottom: orZero(config?.bottom),
        left: orZero(config?.left),
    };
}

export function twoDigitInt(num: number): string {
    return num >= 10 ? num.toString() : `0${num}`;
}

export function joinTagsWithSeparator(tags: JSX.Element[], separator: string): JSX.Element {
    const result: (object | string)[] = [];
    tags.forEach((tag) => result.push(tag, separator));
    result.pop();
    //TODO: rewrite to func and file to .tsx -> .ts
    return <>{result}</>;
}

export function accumFunc(accumulator: number, a: number) {
    return accumulator + a;
}

export function lerpColor(a: string, b: string, amount: number) {
    const ah = +a.replace("#", "0x"),
        ar = ah >> 16,
        ag = (ah >> 8) & 0xff,
        ab = ah & 0xff,
        bh = +b.replace("#", "0x"),
        br = bh >> 16,
        bg = (bh >> 8) & 0xff,
        bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1);
}

// TODO: fix for mobile
export function copyToClipboard(text: string) {
    return navigator.clipboard.writeText(text);
}

export function loadImage(src: string): Promise<void> {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
    });
}

export function loadFont(family: string, src: string): Promise<void> {
    return new Promise<void>((resolve) => {
        const font = new FontFace(family, `url(${src})`);
        font.load().then(() => resolve());
    });
}

// export function openModal<T, K>(modalProps: ModalPropsExtended<T, K>) {
//     triggerEvent("createModal", modalProps);
// }

export function omitObjectKey<T>(key: keyof T, object: T): T {
    const { [key]: value, ...objectWithoutkey } = object;
    return objectWithoutkey as T;
}

export function isPromise(p: any) {
    return p !== null && typeof p === "object" && typeof p.then === "function" && typeof p.catch === "function";
}
