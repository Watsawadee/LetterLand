export { };

jest.setTimeout(30000);

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

const g = globalThis as any;
if (!g.TextEncoder || !g.TextDecoder) {
    const { TextEncoder, TextDecoder } = require("util");
    g.TextEncoder = TextEncoder;
    g.TextDecoder = TextDecoder;
}

if (!g.crypto) {
    try {
        const { webcrypto } = require("crypto");
        g.crypto = webcrypto;
    } catch {
        // ignore
    }
}
const showLogs = process.env.DEBUG_TEST_LOGS === "1";
const L = console.log, W = console.warn, E = console.error;
console.log = (...a: any[]) => { if (showLogs) L(...a); };
console.warn = (...a: any[]) => { if (showLogs) W(...a); };
console.error = (...a: any[]) => { if (showLogs) E(...a); };
