/**
 * Array with a set of shim functions for older browsers
 * we do not extend prototype (rule #1)
 *
 * This is a helper which for now adds the missing flatMap, without prototype pollution
 *
 * that way we can avoid streams wherever we just want to go pure JS
 * This class is self isolated, so it suffices to just dump it into a project one way or the other
 * without anything else
 */
export declare class ExtendedArray<T> extends Array<T> {
    constructor(...items: T[]);
    flatMap(mapperFunction: Function, noFallback?: boolean): ExtendedArray<T>;
}
