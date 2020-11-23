/**
 * IFunctor interface,
 * defines an interface which allows to map a functor
 * via a first order function to another functor
 */
export interface IFunctor<T> {
    map<R>(fn: (data: T) => R): IFunctor<R>;
}
/**
 * IMonad definition, basically a functor with a flaptmap implementation (flatmap reduces all nested monads after a
 * function call f into a monad with the nesting level of 1
 *
 * flatmap flats nested Monads into a IMonad of the deepest nested implementation
 */
export interface IMonad<T, M extends IMonad<any, any>> extends IFunctor<T> {
    flatMap<T, M>(f: (T: any) => M): IMonad<any, any>;
}
/**
 * a stateful functor which holds a value upn which a
 * function can be applied
 *
 * as value holder of type T
 */
export interface IIdentity<T> extends IFunctor<T> {
    readonly value: T;
}
/**
 *  custom value holder definition, since we are not pure functional
 *  but iterative we have structures which allow the assignment of a value
 *  also not all structures are sideffect free
 */
export interface IValueHolder<T> {
    value: T | Array<T>;
}
/**
 * Implementation of a monad
 * (Sideffect free), no write allowed directly on the monads
 * value state
 */
export declare class Monad<T> implements IMonad<T, Monad<any>>, IValueHolder<T> {
    constructor(value: T);
    protected _value: T;
    get value(): T;
    map<R>(fn?: (data: T) => R): Monad<R>;
    flatMap<R>(fn?: (data: T) => R): Monad<any>;
}
/**
 * optional implementation, an optional is basically an implementation of a Monad with additional syntactic
 * sugar on top
 * (Sideeffect free, since value assignment is not allowed)
 * */
export declare class Optional<T> extends Monad<T> {
    static absent: Optional<any>;
    constructor(value: T);
    get value(): T;
    static fromNullable<T>(value?: T): Optional<T>;
    isAbsent(): boolean;
    /**
     * any value present
     */
    isPresent(presentRunnable?: (val?: Monad<T>) => void): boolean;
    ifPresentLazy(presentRunnable?: (val?: Monad<T>) => void): Monad<T>;
    orElse(elseValue: any): Optional<any>;
    /**
     * lazy, passes a function which then is lazily evaluated
     * instead of a direct value
     * @param func
     */
    orElseLazy(func: () => any): Optional<any>;
    flatMap<R>(fn?: (data: T) => R): Optional<any>;
    getIf<R>(...key: string[]): Optional<R>;
    /**
     * simple match, if the first order function call returns
     * true then there is a match, if the value is not present
     * it never matches
     *
     * @param fn the first order function performing the match
     */
    match(fn: (item: T) => boolean): boolean;
    /**
     * convenience function to flatmap the internal value
     * and replace it with a default in case of being absent
     *
     * @param defaultVal
     * @returns {Optional<any>}
     */
    get<R>(defaultVal?: any): Optional<R>;
    toJson(): string;
    /**
     * helper to override several implementations in a more fluent way
     * by having a getClass operation we can avoid direct calls into the constructor or
     * static methods and do not have to implement several methods which rely on the type
     * of "this"
     * @returns {Monadish.Optional}
     */
    protected getClass(): any;
    protected arrayIndex(key: string): number;
    protected keyVal(key: string): string;
    /**
     * additional syntactic sugar which is not part of the usual optional implementation
     * but makes life easier, if you want to sacrifice typesafety and refactoring
     * capabilities in typescript
     */
    getIfPresent<R>(key: string): Optional<R>;
    /**
     * elvis like typesafe functional save resolver
     * a typesafe option for getIfPresent
     *
     * usage myOptional.resolve(value => value.subAttr.subAttr2).orElseLazy(....)
     * if this is resolvable without any errors an Optional with the value is returned
     * if not, then an Optional absent is returned, also if you return Optional absent
     * it is flatmapped into absent
     *
     * @param resolver the resolver function, can throw any arbitrary errors, int  the error case
     * the resolution goes towards absent
     */
    resolve<V>(resolver: (item: T) => V): Optional<V>;
}
/**
 * ValueEmbedder is the writeable version
 * of optional, it basically is a wrappber
 * around a construct which has a state
 * and can be written to.
 *
 * For the readonly version see Optional
 */
export declare class ValueEmbedder<T> extends Optional<T> implements IValueHolder<T> {
    static absent: ValueEmbedder<unknown>;
    protected key: string;
    constructor(rootElem: any, valueKey?: string);
    get value(): T;
    set value(newVal: T);
    orElse(elseValue: any): Optional<any>;
    orElseLazy(func: () => any): Optional<any>;
    /**
     * helper to override several implementations in a more fluent way
     * by having a getClass operation we can avoid direct calls into the constructor or
     * static methods and do not have to implement several methods which rely on the type
     * of "this"
     * @returns {Monadish.Optional}
     */
    protected getClass(): any;
    static fromNullable<T>(value?: any, valueKey?: string): ValueEmbedder<T>;
}
/**
 * Config, basically an optional wrapper for a json structure
 * (not sideeffect free, since we can alter the internal config state
 * without generating a new config), not sure if we should make it sideffect free
 * since this would swallow a lot of performane and ram
 */
export declare class Config extends Optional<any> {
    constructor(root: any);
    get shallowCopy(): Config;
    get deepCopy(): Config;
    static fromNullable<T>(value?: any): Config;
    /**
     * simple merge for the root configs
     */
    shallowMerge(other: Config, overwrite?: boolean, withAppend?: boolean): void;
    /**
     * assigns a single value as array, or appends it
     * to an existing value mapping a single value to array
     *
     *
     * usage myConfig.append("foobaz").value = "newValue"
     *       myConfig.append("foobaz").value = "newValue2"
     *
     * resulting in myConfig.foobaz == ["newValue, newValue2"]
     *
     * @param keys
     */
    append(...keys: any[]): IValueHolder<any>;
    appendIf(condition: boolean, ...keys: any[]): IValueHolder<any>;
    assign(...keys: any[]): IValueHolder<any>;
    assignIf(condition: boolean, ...keys: Array<any>): IValueHolder<any>;
    getIf(...keys: Array<string>): Config;
    get(defaultVal: any): Config;
    delete(key: string): Config;
    toJson(): any;
    protected getClass(): any;
    private setVal;
    /**
     * builds the config path
     *
     * @param keys a sequential array of keys containing either a key name or an array reference name[<index>]
     */
    private buildPath;
}
