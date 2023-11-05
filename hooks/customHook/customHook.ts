import { useState } from "react";

export default function useCustomHook() {
    const [state, setState] = useState(false)
    return state
}