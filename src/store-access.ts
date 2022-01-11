import { GetRateMessageRequest, GetRateMessageResponse, SaveRateMessageRequest } from "./messages";
import { ChromeStorageKey } from "./storages";

export const getRateFromStore = async (url: string): Promise<number | undefined> => {
    const msg: GetRateMessageRequest = { type: "getRate", url };
    return new Promise(resolve => {
        chrome.runtime.sendMessage(msg, (res:GetRateMessageResponse) => resolve(res.rate));
    })
}
export const saveRateToStore = (url: string, rate: number) => {
    const msg: SaveRateMessageRequest = { type:"saveRate", url, rate };
    chrome.runtime.sendMessage(msg);
}
export const convertRateToPercent = (rate: number) => {
    return Math.round(rate * 1000) / 10;
}


export const getChromeStorageString = async (key:ChromeStorageKey): Promise<string | undefined> => {
    const obj = await chrome.storage.local.get(key);
    return obj[key] == null ? undefined : obj[key] as string;
}

export const saveStringToChromeStorage = async (key:ChromeStorageKey, value:string) => {
    return chrome.storage.local.set({ [key]:value });
}