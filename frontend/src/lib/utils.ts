import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function downloadFile({
    data,
    fileName,
    fileType,
}: {
    data: string;
    fileName: string;
    fileType: string;
}) {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType });
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
}

export function detectOS(): "mac" | "windows" | "linux" | "unknown" {
    if (typeof window === "undefined") return "unknown";

    const nav = window.navigator as Navigator & {
        userAgentData?: { platform?: string };
    };

    if (nav.userAgentData?.platform) {
        const platform = nav.userAgentData.platform.toLowerCase();

        if (platform === "macos" || platform.includes("mac")) return "mac";
        if (platform === "windows" || platform.includes("win"))
            return "windows";
        if (platform === "linux") return "linux";

        return "unknown";
    }

    const ua = window.navigator.userAgent.toLowerCase();

    if (
        ua.includes("android") ||
        ua.includes("iphone") ||
        ua.includes("ipad") ||
        ua.includes("ipod")
    ) {
        return "unknown";
    }

    if (ua.includes("macintosh") || ua.includes("mac os x")) {
        return "mac";
    }

    if (ua.includes("windows nt")) {
        return "windows";
    }

    if (ua.includes("linux")) {
        return "linux";
    }

    return "unknown";
}

export function formatShortcut(shortcut: string): string {
    const os = detectOS();
    const isMac = os === "mac";

    if (isMac) {
        // Keep ⌘ for Mac
        return shortcut;
    } else {
        // Replace ⌘ with Ctrl for Windows/Linux
        return shortcut.replace(/⌘/g, "Ctrl");
    }
}
