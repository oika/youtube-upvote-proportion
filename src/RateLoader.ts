import { Language } from "./languages";
import { getChromeStorageString } from "./store-access";

export const fetchRate = async (url:string, lang:Language|undefined): Promise<number | undefined> => {
    const apiKey = await getChromeStorageString("yt-api-key");
    if (apiKey == null || apiKey.trim() === "") {

        if (lang != null) {
            return fetchRateByHtml(url, lang);
        }
        return undefined;
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


const fetchRateByHtml = async (url: string, lang: Language): Promise<number | undefined> => {
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

        const menuButtons = (info.videoActions?.menuRenderer?.topLevelButtons ?? []) as any[];
        const upvoteButton = menuButtons.map(b => b.toggleButtonRenderer)
                                .find(r => r?.defaultIcon?.iconType === "LIKE");
        if (upvoteButton == null) return undefined;

        const upvoteTxt = upvoteButton.defaultText?.accessibility?.accessibilityData?.label;
        if (upvoteTxt == null || (typeof upvoteTxt) !== "string") return undefined;

        const upvote = parseUpvoteCount(upvoteTxt, lang);
        const count = parseViewCount(countText, lang);
        if (upvote == null) return undefined;
        if (count == null) return undefined;

        if (upvote === 0) return 0;

        return upvote / count;

    } catch(err) {
        return undefined;
    }
}


const parseViewCount = (text: string, lang: Language): number | undefined => {
    let res: number;
    switch (lang) {
        case "Japanese":    // X,XXX ?????????
        case "English":     // X,XXX views
        case "Chinese":     // X,XXX?????????
            res = parseInt(text.replace(/,/g, ""));
            break;
        case "Taiwan":      // ???????????????X,XXX???
            res = parseInt(text.substring("???????????????".length).trimStart().replace(/,/g, ""));
            break;
        case "HongKong":    // ???????????????X,XXX ???
            res = parseInt(text.substring("???????????????".length).trimStart().replace(/,/g, ""));
            break;
        case "Italian":     // X.XXX visualizzazioni
        case "German":      // X.XXX Aufrufe
            res = parseInt(text.replace(/\./g, ""));
            break;
        default:
            console.debug("cannot parse view count of lang " + lang);
            return undefined;
    }

    if (res === 0 || isNaN(res)) return undefined;
    return res;
}
const parseUpvoteCount = (text: string, lang: Language): number | undefined => {
    let res: number;
    switch (lang) {
        case "Japanese":    // ????????? X,XXX ???
            res = parseInt(text.substring("?????????".length).trimStart().replace(/,/g, ""));
            break;
        case "English":     // X,XXX likes
        case "Chinese":     // X,XXX ?????????
        case "Taiwan":      // X,XXX ?????????
        case "HongKong":    // X,XXX ???????????????
            res = parseInt(text.replace(/,/g, ""));
            break;
        case "Italian":     // X.XXX Mi piace
        case "German":      // X.XXX "Mag ich"-Bewertungen
            res = parseInt(text.replace(/\./g, ""));
            break;
        default:
            console.debug("cannot parse upvote count of lang " + lang);
            return undefined;
    }

    if (isNaN(res)) return undefined;
    return res;
}