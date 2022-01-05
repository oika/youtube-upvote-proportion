import { GetRateMessageRequest, GetRateMessageResponse, SaveRateMessageRequest } from "./messages";

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