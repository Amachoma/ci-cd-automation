export function mockMatchMedia() {
    function checkForMatch(query) {
        return +(String(query).match(/\d/g)?.join("") || Math.Infinity) <= window.innerWidth;
    }
    const subs = [];
    function mediaChangeHandler(e) {
        subs.forEach((mediaQueryObj) => {
            if (mediaQueryObj.matches !== checkForMatch(mediaQueryObj.media)) {
                mediaQueryObj.onchange(e);
            }
            mediaQueryObj.matches = checkForMatch(mediaQueryObj.media);
        });
    }

    window.addEventListener("resize", mediaChangeHandler);

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
            const obj = {
                matches: checkForMatch(query),
                media: query,
                onchange: null,
                addListener: jest.fn(), // Deprecated
                removeListener: jest.fn(), // Deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            };
            subs.push(obj);
            return obj;
        }),
    });
    //unsub function
    return () => window.removeEventListener("resize", mediaChangeHandler);
}

export function defineScreenSize({ width, height }, withResize = false) {
    Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: width,
    });
    Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: height,
    });
    withResize && window.dispatchEvent(new Event("resize"));
}

export function sleep(number) {
    return new Promise((resolve) => setTimeout(() => resolve(), number));
}
