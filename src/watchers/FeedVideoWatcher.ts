import { WatcherBase } from './WatcherBase';

/**
 * Watcher for feed and search results pages.
 */
export class FeedVideoWatcher extends WatcherBase {
    public static readonly ELEMENT_NAME = "ytd-video-renderer";

    protected watcherName = "feedVideo";
    protected hrefElmQuerySelector = "a#thumbnail";
    protected videoElementName = FeedVideoWatcher.ELEMENT_NAME;
}