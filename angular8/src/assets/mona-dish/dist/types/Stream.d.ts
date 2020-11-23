import { IMonad, IValueHolder, Optional } from "./Monad";
import { ICollector, IStreamDataSource } from "./SourcesCollectors";
export declare type StreamMapper<T> = (data: T) => IStreamDataSource<any>;
export declare type ArrayMapper<T> = (data: T) => Array<any>;
export declare type IteratableConsumer<T> = (data: T, pos?: number) => void | boolean;
export declare type Reducable<T, V> = (val1: T | V, val2: T) => V;
export declare type Matchable<T> = (data: T) => boolean;
export declare type Mappable<T, R> = (data: T) => R;
export declare type Comparator<T> = (el1: T, el2: T) => number;
/**
 * Generic interface defining a stream
 */
export interface IStream<T> {
    /**
     * Perform the operation fn on a single element in the stream at a time
     * then pass the stream over for further processing
     * This is basically an intermediate point in the stream
     * with further processing happening later, do not use
     * this method to gather data or iterate over all date for processing
     * (for the second case each has to be used)
     *
     * @param fn the processing function, if it returns false, further processing is stopped
     */
    onElem(fn: IteratableConsumer<T>): IStream<T>;
    /**
     * Iterate over all elements in the stream and do some processing via fn
     *
     * @param fn takes a single element and if it returns false
     * then further processing is stopped
     */
    each(fn: IteratableConsumer<T>): void;
    /**
     * maps a single element into another via fn
     * @param fn function which takes one element in and returns another
     */
    map<R>(fn?: Mappable<T, R>): IStream<R>;
    /**
     * Takes an element in and returns a set of something
     * the set then is flatted into a single stream to be further processed
     *
     * @param fn
     */
    flatMap<R>(fn?: StreamMapper<T> | ArrayMapper<T>): IStream<R>;
    /**
     * filtering, takes an element in and is processed by fn.
     * If it returns false then further processing on this element is skipped
     * if it returns true it is passed down the chain.
     *
     * @param fn
     */
    filter(fn?: Matchable<T>): IStream<T>;
    /**
     * functional reduce... takes two elements in the stream and reduces to
     * one from left to right
     *
     * @param fn the reduction function for instance (val1,val2) => val1l+val2
     * @param startVal an optional starting value, if provided the the processing starts with this element
     * and further goes down into the stream, if not, then the first two elements are taken as reduction starting point
     */
    reduce<V>(fn: Reducable<T, V>, startVal: T | V): Optional<T | V>;
    /**
     * returns the first element in the stream is given as Optional
     */
    first(): Optional<T>;
    /**
     * Returns the last stream element (note in endless streams without filtering and limiting you will never reach that
     * point hence producing an endless loop)
     */
    last(): Optional<T>;
    /**
     * returns true if there is at least one element where a call fn(element) produces true
     *
     * @param fn
     */
    anyMatch(fn: Matchable<T>): boolean;
    /**
     * returns true if all elmements produce true on a call to fn(element)
     *
     * @param fn
     */
    allMatch(fn: Matchable<T>): boolean;
    /**
     * returns true if no elmements produce true on a call to fn(element)
     *
     * @param fn
     */
    noneMatch(fn: Matchable<T>): boolean;
    /**
     * Collect the elements with a collector given
     * There are a number of collectors provided
     *
     * @param collector
     */
    collect(collector: ICollector<T, any>): any;
    /**
     * sort on the stream, this is a special case
     * of an endpoint, so your data which is fed in needs
     * to be limited otherwise it will fail
     * it still returns a stream for further processing
     *
     * @param comparator
     */
    sort(comparator: Comparator<T>): IStream<T>;
    /**
     * Limits the stream to a certain number of elements
     *
     * @param end the limit of the stream
     */
    limits(end: number): IStream<T>;
    concat(...toAppend: Array<IStream<T>>): IStream<T>;
    /**
     * returns the stream collected into an array (90% use-case abbreviation
     */
    value: Array<T>;
}
/**
 * A simple typescript based reimplementation of streams
 *
 * This is the early eval version
 * for a lazy eval version check, LazyStream, which is api compatible
 * to this implementation, however with the benefit of being able
 * to provide infinite data sources and generic data providers, the downside
 * is, it might be a tad slower in some situations
 */
export declare class Stream<T> implements IMonad<T, Stream<any>>, IValueHolder<Array<T>>, IStream<T> {
    value: Array<T>;
    _limits: number;
    private pos;
    constructor(...value: T[]);
    static of<T>(...data: Array<T>): Stream<T>;
    static ofAssoc<T>(data: {
        [key: string]: T;
    }): Stream<[string, T]>;
    static ofDataSource<T>(dataSource: IStreamDataSource<T>): Stream<T>;
    limits(end: number): Stream<T>;
    /**
     * concat for streams, so that you can concat two streams together
     * @param toAppend
     */
    concat(...toAppend: Array<IStream<T>>): Stream<T>;
    onElem(fn: (data: T, pos?: number) => void | boolean): Stream<T>;
    each(fn: (data: T, pos?: number) => void | boolean): void;
    map<R>(fn?: (data: T) => R): Stream<R>;
    flatMap<IStreamDataSource>(fn: (data: T) => IStreamDataSource | Array<any>): Stream<any>;
    filter(fn?: (data: T) => boolean): Stream<T>;
    reduce<V>(fn: Reducable<T, V | T>, startVal?: V): Optional<V | T>;
    first(): Optional<T>;
    last(): Optional<T>;
    anyMatch(fn: Matchable<T>): boolean;
    allMatch(fn: Matchable<T>): boolean;
    noneMatch(fn: Matchable<T>): boolean;
    sort(comparator: Comparator<T>): IStream<T>;
    collect(collector: ICollector<T, any>): any;
    hasNext(): boolean;
    next(): T;
    reset(): void;
}
/**
 * Lazy implementation of a Stream
 * The idea is to connect the intermediate
 * streams as datasources like a linked list
 * with reverse referencing and for special
 * operations like filtering flatmapping
 * have intermediate datasources in the list
 * with specialized functions.
 *
 * Sort of a modified pipe valve pattern
 * the streams are the pipes the intermediate
 * data sources are the valves
 *
 * We then can use passed in functions to control
 * the flow in the valves
 *
 * That way we can have a lazy evaluating stream
 *
 * So if an endpoint requests data
 * a callback trace goes back the stream list
 * which triggers an operation upwards
 * which sends data down the drain which then is processed
 * and filtered until one element hits the endpoint.
 *
 * That is repeated, until all elements are processed
 * or an internal limit is hit.
 *
 */
export declare class LazyStream<T> implements IStreamDataSource<T>, IStream<T>, IMonad<T, LazyStream<any>> {
    protected dataSource: IStreamDataSource<T>;
    _limits: number;
    pos: number;
    static of<T>(...values: Array<T>): LazyStream<T>;
    static ofAssoc<T>(data: {
        [key: string]: T;
    }): LazyStream<[string, T]>;
    static ofStreamDataSource<T>(value: IStreamDataSource<T>): LazyStream<T>;
    constructor(parent: IStreamDataSource<T>);
    hasNext(): boolean;
    next(): T;
    reset(): void;
    /**
     * concat for streams, so that you can concat two streams together
     * @param toAppend
     */
    concat(...toAppend: Array<IStream<T>>): LazyStream<T>;
    nextFilter(fn: Matchable<T>): T;
    limits(max: number): LazyStream<T>;
    collect(collector: ICollector<T, any>): any;
    onElem(fn: IteratableConsumer<T>): LazyStream<T>;
    filter(fn: Matchable<T>): LazyStream<T>;
    map<R>(fn: Mappable<T, R>): LazyStream<any>;
    flatMap<StreamMapper>(fn: StreamMapper | ArrayMapper<any>): LazyStream<any>;
    each(fn: IteratableConsumer<T>): void;
    reduce<V>(fn: Reducable<T, V>, startVal?: T | V): Optional<T | V>;
    last(): Optional<T>;
    first(): Optional<T>;
    anyMatch(fn: Matchable<T>): boolean;
    allMatch(fn: Matchable<T>): boolean;
    noneMatch(fn: Matchable<T>): boolean;
    sort(comparator: Comparator<T>): IStream<T>;
    get value(): Array<T>;
    private stop;
    private isOverLimits;
}
