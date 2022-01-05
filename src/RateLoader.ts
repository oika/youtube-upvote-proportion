const UPVOTE_PREFIX = "高評価";

export const fetchRate = async (url: string): Promise<number | undefined> => {
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