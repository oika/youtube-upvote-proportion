import { WatcherBase } from './WatcherBase';

/**
 * Watcher for top page.
 */
export class RichItemWatcher extends WatcherBase {
    public static readonly ELEMENT_NAME = "ytd-rich-item-renderer";

    protected watcherName = "richItem";
    protected hrefElmQuerySelector = "a#thumbnail";
    protected videoElementName = RichItemWatcher.ELEMENT_NAME;
}