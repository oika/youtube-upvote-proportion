import $ from 'jquery';

const UPVOTE_PREFIX = "高評価";

const rateMap = new Map<string, number>();

const refresh = () => {
    $("div#content").each((_,content) => {
        (async () => {
            const elm = content.querySelector("a#thumbnail");
            if (elm == null) return;

            const url = elm.getAttribute("href") ?? "";
            if (!url.startsWith("/watch?v=")) return;
    
            let rate = rateMap.get(url);
            if (rate == null) {
                rate = await fetchRate(url);
                if (rate != null) {
                    rateMap.set(url, rate);
                }
            }
            if (rate != null) {
                insertRate(rate, content);
            }
        })();
    });
}

const observer = new MutationObserver(refresh);

$(() => {
    const container = document.querySelector("#contents");
    if (container != null) {
        observer.observe(container, { childList:true });

        //initial load
        refresh();
    }
})


const fetchRate = async (url: string): Promise<number | undefined> => {
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

const insertRate = (rate: number, content: HTMLElement) => {

    const percent = Math.round(rate * 1000) / 10;

    const metalines = $(content).find("div#details #meta ytd-video-meta-block #metadata-line");
    if (metalines.length !== 1) return;

    const line = metalines[0];
    $(line).children(".upvote-percent").each((_,e) => e.remove());

    const span = document.createElement("span");
    span.className = "upvote-percent";
    span.textContent = `👍${percent}%`;

    line.append(span);
}

