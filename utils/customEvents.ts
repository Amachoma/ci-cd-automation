function addEventListener(eventName: string, listener: (e: Event) => void) {
    document.addEventListener(eventName, listener);
}

function removeEventListener(eventName: string, listener: (e: Event) => void) {
    document.removeEventListener(eventName, listener);
}

function once(eventName: string, listener: (e: Event) => void) {
    addEventListener(eventName, handleEventOnce);

    function handleEventOnce(event: Event) {
        listener(event);
        removeEventListener(eventName, handleEventOnce);
    }
}

function triggerEvent<T extends object>(eventName: string, args?: T) {
    const event = new CustomEvent(eventName, { detail: args });
    document.dispatchEvent(event);
}

export { addEventListener, once, removeEventListener, triggerEvent };