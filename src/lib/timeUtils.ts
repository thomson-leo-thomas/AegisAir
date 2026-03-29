export function parseFirebaseKeyToTimestamp(key: string): number {
    // If numeric key
    if (/^\d+$/.test(key)) {
        const num = Number(key);
        // If earlier than Sep 2001 in ms, it's probably in seconds instead of ms
        if (num < 1000000000000) {
            return num * 1000;
        }
        return num;
    }

    // Firebase Push ID format
    if (key.startsWith("-") && key.length >= 8) {
        const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
        let time = 0;
        for (let i = 0; i < 8; i++) {
            const charIdx = PUSH_CHARS.indexOf(key.charAt(i));
            if (charIdx === -1) return NaN;
            time = time * 64 + charIdx;
        }
        return time;
    }

    return NaN;
}
