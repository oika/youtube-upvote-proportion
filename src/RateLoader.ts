import { getChromeStorageString } from "./store-access";

const UPVOTE_PREFIX = "高評価";

export const fetchRate = async (url:string): Promise<number | undefined> => {
    const apiKey = await getChromeStorageString("yt-api-key");
    if (apiKey == null || apiKey.trim() === "") {
        return fetchRateByHtml(url);
    }

    return fetchRateUsingApi(url, apiKey);
}

const fetchRateUsingApi = async (url:string, apiKey: string): Promise<number | undefined> => {
    const id = parseIdFromUrl(url);
    if (id == null) return undefined;

    const endpoint = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${apiKey}&part=statistics&fields=items(statistics)`;

    try {
        const res = await fetch(endpoint);
        const text = await res.text();
        if (text === "") return undefined;
        const json = JSON.parse(text);

        const items = json.items as any[];
        if (items == null || items.length !== 1) return undefined;
        const view = Number(items[0].statistics?.viewCount ?? 0);
        const like = Number(items[0].statistics?.likeCount ?? 0);
        if (isNaN(view) || view === 0) return undefined;
        if (isNaN(like)) return undefined;
        if (like === 0) return 0;

        return like / view;

    } catch(err) {
        return undefined;
    }

}

const parseIdFromUrl = (url:string) => {
    const stIdx = url.indexOf("v=");
    if (stIdx < 0) return undefined;

    const edIdx = url.indexOf("&", stIdx + 2);
    return url.substring(stIdx + 2, edIdx < 0 ? undefined : edIdx);
}


const fetchRateByHtml = async (url: string): Promise<number | undefined> => {
    try {
        const res = await fetch(url);
        const text = await res.text();
        const dom = new DOMParser().parseFromString(text, "text/html");

        const initData = [...dom.querySelectorAll("script").values()]
                .find(scr => scr.textContent?.startsWith("var ytInitialData ="))
                ?.textContent;
        if (initData == null) return undefined;
        const json = JSON.parse(initData.substring("var ytInitialData = ".length, initData.length -1));

        const contents = (json.contents?.twoColumnWatchNextResults?.results?.results?.contents ?? []) as any[];
        const info = contents.find(c => c.videoPrimaryInfoRenderer != null)?.videoPrimaryInfoRenderer;
        if (info == null) return undefined;
        
        const countText = info.viewCount?.videoViewCountRenderer?.viewCount?.simpleText;
        if (countText == null) return undefined;
        const count = parseInt(countText.replace(/,/g, ""));
        if (count === 0 || isNaN(count)) return undefined;

        const voteButtons = (info.videoActions?.menuRenderer?.topLevelButtons ?? []) as any[];
        const upvoteTxt = voteButtons.map(b => b.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label ?? "")
                                .find(l => typeof(l) === "string" && l.startsWith(UPVOTE_PREFIX));
        if (upvoteTxt == null) return undefined;
        const upvote = parseInt(upvoteTxt.substring(UPVOTE_PREFIX.length).trimStart().replace(/,/g, ""));
        if (isNaN(upvote)) return undefined;

        if (upvote === 0) return 0;

        return upvote / count;

    } catch(err) {
        return undefined;
    }
}