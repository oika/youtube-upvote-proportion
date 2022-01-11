const CHROME_STORAGE_KEYS = [ "yt-api-key" ] as const;

export type ChromeStorageKey = typeof CHROME_STORAGE_KEYS[number];