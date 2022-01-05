import $ from 'jquery';
import { fetchRate } from '../RateLoader';
import { convertRateToPercent, getRateFromStore, saveRateToStore } from '../store-access';

const CLASS_NAME_ADD = "upvote-percent";

/**
 * Watcher for top page.
 */
export class RichItemWatcher {
    public static readonly ELEMENT_NAME = "ytd-rich-item-renderer";

    readonly observer: MutationObserver;

    constructor() {
        this.observer = new MutationObserver(this.onObserved);
    }

    public watch = (videoElement: Element) => {
        // watch url change
        const thumb = videoElement.querySelector("a#thumbnail");
        if (thumb == null) {
            console.debug("failed to watch", videoElement);
            return;
        }

        // initial value
        const url = thumb.getAttribute("href");
        if (url != null && url.startsWith("/watch")) {  // ignore channnels
            this.refreshElement(url, videoElement);
        }

        this.observer.observe(thumb, { attributes:true, attributeFilter:["href"] });
    }


    private onObserved = (records: MutationRecord[]) => {
        for (const rec of records) {
            if (rec.attributeName !== "href" || !(rec.target instanceof Element)) {
                console.warn("invalid mutation observed", rec);
                continue;
            }
            const videoElm = $(rec.target).closest(RichItemWatcher.ELEMENT_NAME);
            if (videoElm == null || videoElm.length === 0) {
                console.debug("video container element not found", rec);
                continue;
            }
            const url = rec.target.getAttribute("href");
            if (url == null || !url.startsWith("/watch")) continue;  // ignore channnels

            this.refreshElement(url, videoElm[0]);
        }
    }

    private refreshElement = async (url:string, videoElement: Element) => {
        console.debug("start refresh " + url);

        this.clearRate(videoElement);

        let rate = await getRateFromStore(url);
        if (rate == null) {
            rate = await fetchRate(url);
            if (rate != null) {
                saveRateToStore(url, rate);
            }
        }
        if (rate == null) {
            console.debug("can't refresh " + url);
            return;
        }

        this.clearRate(videoElement);   // clear again before insert
        this.insertRate(videoElement, rate);
    
        console.debug("finish refresh " + url);
    }


    private clearRate = (videoElement: Element) => {
        const line = this.findMetaLine(videoElement);
        if (line == null) return;
        $(line).children("." + CLASS_NAME_ADD).each((_,e) => e.remove());
    }
    private insertRate = (videoElement: Element, rate: number) => {
        const line = this.findMetaLine(videoElement);
        if (line == null) return;
        
        const percent = convertRateToPercent(rate);

        const span = document.createElement("span");
        span.className = CLASS_NAME_ADD;
        span.textContent = `👍${percent}%`;
        
        line.append(span);
    }
    private findMetaLine = (videoElement: Element) => {
        const metaLine = videoElement.querySelector("ytd-video-meta-block #metadata #metadata-line");
        if (metaLine == null) {
            console.debug("meta line not found", videoElement);
            return;
        }
        return metaLine;
    }

    public dispose = () => {
        this.observer.disconnect();
    }
    
}