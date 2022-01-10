export type MessageRequrest = GetRateMessageRequest | SaveRateMessageRequest;

export interface GetRateMessageRequest {
    type: "getRate",
    url: string
}
export interface SaveRateMessageRequest {
    type: "saveRate",
    url: string,
    rate: number
}

export type MessageResponse = GetRateMessageResponse;

export interface GetRateMessageResponse {
    type: "getRate",
    rate: number | undefined
}