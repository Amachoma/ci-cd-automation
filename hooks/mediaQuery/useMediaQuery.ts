import { useState, useEffect } from "react";

import { ResizeConfig } from "./interfaces";

export function getCurrentConfig<T>(configs: ResizeConfig<T>): T {
    let minValue = Infinity;
    for (const maxWidthKey of Object.keys(configs)) {
        const maxWidth = parseInt(maxWidthKey);
        if (minValue > maxWidth && maxWidth > window.innerWidth) {
            minValue = maxWidth;
        }
    }
    return minValue === Infinity ? configs.default : configs[minValue];
}

export default function useMediaQuery<T>(configs: ResizeConfig<T>): T {
    const [mediaQueryConfig, setMediaQueryConfig] = useState<T>(configs.default);

    useEffect(() => {
        // Init default config
        setMediaQueryConfig(getCurrentConfig(configs));

        let timeStamp = 0;
        function onMediaQuery(event: MediaQueryListEvent) {
            if (event.timeStamp !== timeStamp) {
                setMediaQueryConfig(getCurrentConfig(configs));
                timeStamp = event.timeStamp;
            }
        }

        const mediaQueryArray: MediaQueryList[] = Object.keys(configs)
            .filter((res) => res !== "default")
            .map((targetResolution) => {
                return window.matchMedia(`screen and (max-width: ${targetResolution}px)`);
            });
        mediaQueryArray.forEach((query) => (query.onchange = onMediaQuery));
        return () => {
            mediaQueryArray.forEach((query) => query.removeEventListener("change", onMediaQuery));
        };
    }, [configs]);

    return mediaQueryConfig;
}
