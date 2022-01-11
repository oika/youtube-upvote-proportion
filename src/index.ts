import { selectLanguage } from './languages';
import { CompactVideoWatcher } from './watchers/CompactVideowatcher';
import { FeedVideoWatcher } from './watchers/FeedVideoWatcher';
import { RichItemWatcher } from './watchers/RichItemWatcher';

const langVal = document.querySelector("html")?.getAttribute("lang");
let lang = selectLanguage(langVal);
if (lang == null) {
    console.error("Unsupported Language " + langVal);
}

const richItem = new RichItemWatcher(lang);
const feedVideo = new FeedVideoWatcher(lang);
const compactVideo = new CompactVideoWatcher(lang);

let pageObserver: MutationObserver;
const pg = document.querySelector("ytd-app #page-manager");
if (pg == null) {
    console.warn("failed to start observer");
} else {
    //watch initial elements
    richItem.watch([...pg.querySelectorAll(RichItemWatcher.ELEMENT_NAME).values()]);
    feedVideo.watch([...pg.querySelectorAll(FeedVideoWatcher.ELEMENT_NAME).values()]);
    compactVideo.watch([...pg.querySelectorAll(CompactVideoWatcher.ELEMENT_NAME).values()]);

    //observe appended
    pageObserver = new MutationObserver(records => {

        const added = records.flatMap(r => [...r.addedNodes.values()])
                        .filter((n):n is Element => n instanceof Element);
        const richItems = added.filter(n => n.localName === RichItemWatcher.ELEMENT_NAME);
        const feedVideos = added.filter(n => n.localName === FeedVideoWatcher.ELEMENT_NAME);
        const compacts = added.filter(n => n.localName === CompactVideoWatcher.ELEMENT_NAME);
        richItem.watch(richItems);
        feedVideo.watch(feedVideos);
        compactVideo.watch(compacts);

    });
    pageObserver.observe(pg, { subtree:true, childList:true });
}