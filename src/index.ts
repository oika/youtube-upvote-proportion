import { FeedVideoWatcher } from './watchers/FeedVideoWatcher';
import { RichItemWatcher } from './watchers/RichItemWatcher';

const richItem = new RichItemWatcher();
const feedVideo = new FeedVideoWatcher();

let pageObserver: MutationObserver;
const pg = document.querySelector("ytd-app #page-manager");
if (pg == null) {
    console.warn("failed to start observer");
} else {
    //watch initial elements
    pg.querySelectorAll(RichItemWatcher.ELEMENT_NAME).forEach(elm => {
        richItem.watch(elm);
    })
    pg.querySelectorAll(FeedVideoWatcher.ELEMENT_NAME).forEach(elm => {
        feedVideo.watch(elm);
    });

    //observe appended
    pageObserver = new MutationObserver(records => {
        for (const rec of records) {
            for (const node of rec.addedNodes.values()) {
                if (!(node instanceof Element)) continue;

                if (node.localName === RichItemWatcher.ELEMENT_NAME) {
                    richItem.watch(node);
                    continue;
                }
                if (node.localName === FeedVideoWatcher.ELEMENT_NAME) {
                    feedVideo.watch(node);
                    continue;
                }
                if (node.localName === "ytd-compact-video-renderer") {
                    //TODO
                    console.log("related: ビデオ追加");
                    continue;
                }
            }
        }

    });
    pageObserver.observe(pg, { subtree:true, childList:true });
}