const LANGUAGES = ["Japanese", "English", "German", "Chinese", "Taiwan", "HongKong", "Italian"] as const;
export type Language = typeof LANGUAGES[number];

export const selectLanguage = (langAttribute: string|null|undefined): Language | undefined => {
    if (langAttribute == null) return undefined;

    switch (langAttribute.toUpperCase()) {
        case "JA-JP":
            return "Japanese";
        case "EN":
        case "EN-GB":
        case "EN-IN":
            return "English";
        case "DE-DE":
            return "German";
        case "ZH-HANS-CN":
            return "Chinese";
        case "ZH-HANT-TW":
            return "Taiwan";
        case "ZH-HANT-HK":
            return "HongKong";
        case "IT-IT":
            return "Italian";
        default:
            return undefined;
    }
}

