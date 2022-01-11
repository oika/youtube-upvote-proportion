import $ from 'jquery';
import { Language } from '../languages';
import { fetchRate } from '../RateLoader';
import { convertRateToPercent, getRateFromStore, saveRateToStore } from '../store-access';

const CLASS_NAME_ADD = "upvote-percent";

export abstract class WatcherBase {
    protected abstract readonly watcherName: string;
    protected abstract readonly videoElementName: string;
    protected abstract readonly hrefElmQuerySelector: string;   //"a#thumbnail"

    readonly observer: MutationObserver;

    constructor(private readonly lang: Language|undefined) {
        this.observer = new MutationObserver(this.onObserved);
    }

    public watch = (videoElements: Element[]) => {
        const toInitializes: { element: Element, url:string }[] = [];

        for (const elm of videoElements) {
            // watch url change
            const thumb = elm.querySelector(this.hrefElmQuerySelector);
            if (thumb == null) {
                this.logDebug("failed to watch", elm);
                continue;
            }
            this.observer.observe(thumb, { attributes:true, attributeFilter:["href"], attributeOldValue:true });

            // initial value
            const url = thumb.getAttribute("href");
            if (url != null && url.startsWith("/watch")) {  // ignore channnels
                toInitializes.push({ element:elm, url });
            }
        }

        this.refreshElements(toInitializes);
    }

    private refreshElements = async (targets: { url: string, element: Element }[]) => {
        const needFetch: typeof targets = [];

        //clear old values and use stored rates if exists.
        for (const target of targets) {
            this.clearRate(target.element);
            const rate = await getRateFromStore(target.url);
            if (rate != null) {
                this.logDebug("use cache rate " + target.url);
                this.insertRate(target.element, rate);
                continue;
            }

            needFetch.push(target);
        }

        // fetch one by one
        for (const target of needFetch) {
            const currentUrl = target.element.querySelector(this.hrefElmQuerySelector)?.getAttribute("href");
            if (target.url !== currentUrl) {
                this.logDebug(`url already changed from ${target.url} to ${currentUrl}`);
                continue;
            }

            this.logDebug("fetch rate " + target.url);
            const rate = await fetchRate(target.url, this.lang);
            if (rate == null) {
                this.logDebug("can't refresh " + target.url);
                continue;
            }
            saveRateToStore(target.url, rate);

            this.clearRate(target.element); // clear again before insert
            this.insertRate(target.element, rate);
        }
    }


    private onObserved = (records: MutationRecord[]) => {
        this.logDebug("href change observed", records);

        const targets: { url:string, element:Element }[] = [];

        for (const rec of records) {
            if (rec.attributeName !== "href" || !(rec.target instanceof Element)) {
                console.warn("invalid mutation observed", rec);
                continue;
            }
            const videoElm = $(rec.target).closest(this.videoElementName);
            if (videoElm == null || videoElm.length === 0) {
                this.logDebug("video container element not found", rec);
                continue;
            }
            const url = rec.target.getAttribute("href");
            if (url == null || !url.startsWith("/watch")) continue;  // ignore channnels

            targets.push({ url, element: videoElm[0] });
        }

        this.refreshElements(targets);
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
            this.logDebug("meta line not found", videoElement);
            return;
        }
        return metaLine;
    }

    public dispose = () => {
        this.observer.disconnect();
    }

    private logDebug = (message?: any, ...optionalParams: any[]) => {
        console.debug(`[${this.watcherName}] ${message}`, ...optionalParams);
    }
    
}