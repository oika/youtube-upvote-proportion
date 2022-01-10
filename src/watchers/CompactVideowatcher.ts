import { WatcherBase } from './WatcherBase';

/**
 * Watcher for related videos in watch page.
 */
export class CompactVideoWatcher extends WatcherBase {
    public static readonly ELEMENT_NAME = "ytd-compact-video-renderer";

    protected watcherName = "compactVideo";
    protected hrefElmQuerySelector = "a#thumbnail";
    protected videoElementName = CompactVideoWatcher.ELEMENT_NAME;
}