import { toast, ToastOptions, UpdateOptions } from "react-toastify";

export class Toast {
    private readonly id: string;

    constructor() {
        this.id = Math.floor(Math.random() * 1048576).toString(16);
    }

    loading(content: string, options?: ToastOptions) {
        // toast.loading(i18next.t(content), { ...options, toastId: this.id });
        toast.loading(content, { ...options, toastId: this.id });
    }

    info(content: string, options?: ToastOptions) {
        // toast.info(i18next.t(content), { ...options, toastId: this.id });
        toast.info(content, { ...options, toastId: this.id });
    }

    update(options: UpdateOptions) {
        // toast.update(this.id, { ...options, render: i18next.t((options.render || "").toString()) });
        toast.update(this.id, { ...options, render: (options.render || "").toString() });
    }

    done() {
        toast.done(this.id);
    }
}
