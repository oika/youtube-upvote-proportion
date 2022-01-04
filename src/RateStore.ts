import dayjs from "dayjs";
import { GetRateMessageRequest, GetRateMessageResponse, MessageRequrest, SaveRateMessageRequest } from "./messages";

type RateInfo = { rate:number, fetchedAt:Date };

const EXPIRES_MINUTES = 60;

export class RateStore {

    readonly rateMap = new Map<string, RateInfo>();

    constructor() {
        chrome.runtime.onMessage.addListener((msg: MessageRequrest, sender, sendResponse) => {
            if (msg.type === "getRate") {
                this.onGetRate(msg, sendResponse);
                return;
            }

            if (msg.type === "saveRate") {
                this.onSaveRate(msg);
                return;
            }
        });
    }

    private onGetRate = (msg: GetRateMessageRequest, sendResponse:(res:GetRateMessageResponse) => void) => {
        const info = this.rateMap.get(msg.url);
        let res: GetRateMessageResponse;
        
        if (info == null) {
            res = { type: "getRate", rate: undefined };
        } else {
            const now = dayjs();
            const expired = dayjs(info.fetchedAt).diff(now, "minute") >= EXPIRES_MINUTES;
            res = { type: "getRate", rate: expired ? undefined : info.rate };
        }

        sendResponse(res);
    }

    private onSaveRate = (msg: SaveRateMessageRequest) => {
        this.rateMap.set(msg.url, { rate: msg.rate, fetchedAt: dayjs().toDate() });
    }
}