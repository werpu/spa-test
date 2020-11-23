# Mona-dish

A set of functional programming "inspired" helpers


## What is it?

This project is a set of small helpers which utilize mostly monad and monad like patterns 
to cut down on code for essential tasks.

For now it is only a small set of Helpers consisting of following items:

* Monad     ... an implementation of a Monad
* [Optional](https://github.com/werpu/mona-dish/blob/master/docs/Optional.md)  ... a class which is derived from Javas optional but also encapsulates elvis operator like accessors
                to cut down on code
* [ValueEmbedder](https://github.com/werpu/mona-dish/blob/master/docs/ValueEmbedder.md) ... if you ever need something like optional but want to write the value as well
                    this might be what you are looking for                 
* Promise   ... a promise shim implementation for older browsers (newer ones have Promised baked in)
* CancellablePromise ... a promise with cancel functionality
* Configuration ... an Optional utilizing wrapper over json configurations which allow both read and write access 
                   and elvis like access to the data stored in the config
* [Streams](https://github.com/werpu/mona-dish/blob/master/docs/Stream.md) ... a typescript based implementation of early and lazily evaluating streams                   
* DomQuery ... a jquery like functional query and dom manipulation engine based on querySelectorAll, also support streams and shadow doms
* XmlQuery ... a jquery like XML document query selection and manipulation engine ... also supports streams
* [Messaging](https://github.com/werpu/mona-dish/blob/master/docs/Messaging.md) ... a messaging bus which can break page isolation levels to allow communication between iframes/popups/shadow dom/dom


## Implementation languages
              
Everything is implemented in typescript and can be used straight from the source directories "src/main/typescript".

However also javascript transpilations for various packacking systems and ecmascript levels are in place as well hosted under "dist".

If you want a cleaner cut between your own typescript sources and the mona-dish sources there is a d.ts file also,
hosted under "dist".


## building

For building the project you need following
* npm
* webpack

once this is done you can build it by calling ./init.sh one time to install all the needed build dependencies,
after that calling /build.sh rebuilds the entire project.

You also can run mocha based unit tests on the project by calling ./test.sh

(note this is for unixoid systems, windows command files will be added soon, in the meanwhile simply check the command 
sequences in the sh files for building and testing)


## Usage

### Optional

The enhanced documentation for optional can be found here:

* [Optional Documentation](https://github.com/werpu/mona-dish/blob/master/docs/Optional.md)


  
For a non sideffect free implementation, you can use:

### ValueEmbedder  
  
Optional is a purely reasonly construct, now for sideffects
freenes having only readonly operations is fine.
However in iterative systems we often deal with states.
To get the conciciveness of Optional also for
writeable states there is a class available which is inherited
from optional and hence shares the same functionality.

* ValueEmedder

* [ValueEmbedder Documentation](https://github.com/werpu/mona-dish/blob/master/docs/ValueEmbedder.md)

 
  
### Configuration  

* [Configuration Documentation](https://github.com/werpu/mona-dish/blob/master/docs/Configuration.md)


### Promise and CancellablePromise

Promise is just a lightweight shim of the Promise API including finally.
Cancellable promise adds on top of that by allowing to cancel 
(aka never hit the then/cancel phase)

### DomQuery

A small lightweight thin layer on top of the standardized dom apis which readds jquery like 
monadish patterns on top of the existing dom elements.
It omits a base parser, given that modern browsers have excellent qerying capabilits
just with the overhead of an iterative API.
DomQuery readds the slickness of functional patterns, which are perfect for the job of Tree Querying.

```Typescript
interface IDomQuery {
    /**
     * reads the first element if it exists and returns an optional
     */
    readonly value: Optional<Element>;
    /**
     * All elements as array
     */
    readonly values: Element[];
    /**
     * returns the id as settable value (See also ValueEmbedder)
     */
    readonly id: ValueEmbedder<string>;
    /**
     * returns the length of embedded nodes (top level)
     */
    readonly length: number;
    /**
     * the tag name of the first element
     */
    readonly tagName: Optional<string>;
    /**
     * the node name of the first element
     */
    readonly nodeName: Optional<string>;
    /**
     * the type of the first element
     */
    readonly type: Optional<string>;
    /**
     * The name as changeable value
     */
    readonly name: ValueEmbedder<string>;
    /**
     * The the value in case of inputs as changeable value
     */
    readonly inputValue: ValueEmbedder<string>;
    /**
     * the underlying form elements as domquery object
     */
    readonly elements: DomQuery;
    /**
     * settable flag for disabled
     */
    disabled: boolean;
    /**
     * The child nodes of this node collection as readonly attribute
     */
    readonly childNodes: DomQuery;
    /**
     * an early stream representation for this DomQuery
     */
    readonly stream: Stream<DomQuery>;
    /**
     * lazy stream representation for this DomQuery
     */
    readonly lazyStream: LazyStream<DomQuery>;
    /**
     * transform this node collection to an array
     */
    readonly asArray: Array<DomQuery>;

    /**
     * returns true if the elements have the tag *tagName* as tag embedded (highest level)
     * @param tagName
     */
    isTag(tagName: string): boolean;

    /**
     * returns the nth element as domquery
     * from the internal elements
     * note if you try to reach a non existing element position
     * you will get back an absent entry
     *
     * @param index the nth index
     */
    get(index: number): DomQuery;

    /**
     * returns the nth element as optional of an Element object
     * @param index the number from the index
     * @param defaults the default value if the index is overrun default Optional.absent
     */
    getAsElem(index: number, defaults: Optional<any>): Optional<Element>;

    /**
     * returns the value array< of all elements
     */
    allElems(): Array<Element>;

    /**
     * absent no values reached?
     */
    isAbsent(): boolean;

    /**
     * should make the code clearer
     * note if you pass a function
     * this refers to the active dopmquery object
     */
    isPresent(presentRunnable ?: (elem ?: DomQuery) => void): boolean;

    /**
     * should make the code clearer
     * note if you pass a function
     * this refers to the active dopmquery object
     *
     *
     * @param presentRunnable
     */
    ifPresentLazy(presentRunnable: (elem ?: DomQuery) => void): DomQuery;

    /**
     * remove all affected nodes from this query object from the dom tree
     */
    delete(): void;

    /**
     * query selector all on the existing dom query object
     *
     * @param selector the standard selector
     * @return a DomQuery with the results
     */
    querySelectorAll(selector): DomQuery;

    /**
     * core byId method
     * @param id the id to search for
     * @param includeRoot also match the root element?
     */
    byId(id: string, includeRoot?: boolean): DomQuery;

    /**
     * same as byId just for the tag name
     * @param tagName
     * @param includeRoot
     */
    byTagName(tagName: string, includeRoot ?: boolean): DomQuery;

    /**
     * attr accessor, usage myQuery.attr("class").value = "bla"
     * or let value myQuery.attr("class").value
     * @param attr the attribute to set
     * @param defaultValue the default value in case nothing is presented (defaults to null)
     */
    attr(attr: string, defaultValue: string): ElementAttribute;

    /**
     * hasclass, checks for an existing class in the class attributes
     *
     * @param clazz the class to search for
     */
    hasClass(clazz: string): boolean;

    /**
     * appends a class string if not already in the element(s)
     *
     * @param clazz the style class to append
     */
    addClass(clazz: string): DomQuery;

    /**
     * remove the style class if in the class definitions
     *
     * @param clazz
     */
    removeClass(clazz: string): DomQuery;

    /**
     * checks whether we have a multipart element in our children
     */
    isMultipartCandidate(): boolean;

    /**
     * innerHtml equivalkent
     * equivalent to jqueries html
     * as setter the html is set and the
     * DomQuery is given back
     * as getter the html string is returned
     *
     * @param inval
     */
    html(inval?: string): DomQuery | Optional<string>;

    /**
     * easy node traversal, you can pass
     * a set of node selectors which are joined as direct childs
     *
     * not the rootnodes are not in the getIf, those are always the child nodes
     *
     * @param nodeSelector
     */
    getIf(...nodeSelector: Array<string>): DomQuery;

    /**
     * iterate over each element and perform something on the element
     * (Dom element is passed instead of DomQuery)
     * @param func
     */
    eachElem(func: (item: Element, cnt?: number) => any): DomQuery;

    /**
     * perform an operation on the first element
     * returns a DomQuery on the first element only
     * @param func
     */
    firstElem(func: (item: Element, cnt?: number) => any): DomQuery;

    /**
     * same as eachElem, but a DomQuery object is passed down
     *
     * @param func
     */
    each(func: (item: DomQuery, cnt?: number) => any): DomQuery;

    /**
     * returns a new dom query containing only the first element max
     *
     * @param func a an optional callback function to perform an operation on the first element
     */
    first(func: (item: DomQuery, cnt?: number) => any): DomQuery;

    /**
     * filter function which filters a subset
     *
     * @param func
     */
    filter(func: (item: DomQuery) => boolean): DomQuery;

    /**
     * global eval head appendix method
     * no other methods are supported anymore
     * @param code the code to be evaled
     * @param  nonce optional  nonce key for higher security
     */
    globalEval(code: string, nonce ?: string): DomQuery;

    /**
     * detaches a set of nodes from their parent elements
     * in a browser independend manner
     * @param {Object} items the items which need to be detached
     * @return {Array} an array of nodes with the detached dom nodes
     */
    detach(): DomQuery;

    /**
     * appends the current set of elements
     * to the element or first element passed via elem
     * @param elem
     */
    appendTo(elem: DomQuery): void;

    /**
     * loads and evals a script from a source uri
     *
     * @param src the source to be loaded and evaled
     * @param defer in miliseconds execution default (0 == no defer)
     * @param charSet
     */
    loadScriptEval(src: string, defer: number, charSet: string): void;

    /**
     * insert toInsert after the current element
     *
     * @param toInsert an array of DomQuery objects
     */
    insertAfter(...toInsert: Array<DomQuery>): DomQuery;

    /**
     * inserts the elements before the current element
     *
     * @param toInsert
     */
    insertBefore(...toInsert: Array<DomQuery>): DomQuery;

    /**
     * in case the domquery is pointing to nothing the else value is taken into consideration
     * als alternative
     *
     * @param elseValue the else value
     */
    orElse(...elseValue: any): DomQuery;

    /**
     * the same with lazy evaluation for cases where getting the else value
     * is a heavy operation
     *
     * @param func the else provider function
     */
    orElseLazy(func: () => any): DomQuery;

    /**
     * all parents with TagName
     * @param tagName
     */
    parents(tagName: string): DomQuery;

    /**
     * copy all attributes of sourceItem to this DomQuery items
     *
     * @param sourceItem the source item to copy over (can be another domquery or a parsed XML Query item)
     */
    copyAttrs(sourceItem: DomQuery | XMLQuery): DomQuery;

    /**
     * outerhtml convenience method
     * browsers only support innerHTML but
     * for instance for your jsf.js we have a full
     * replace pattern which needs outerHTML processing
     *
     * @param markup
     * @param runEmbeddedScripts
     * @param runEmbeddedCss
     */
    outerHTML(markup: string, runEmbeddedScripts ?: boolean, runEmbeddedCss ?: boolean): DomQuery;

    /**
     * Run through the given nodes in the DomQuery execute the inline scripts
     * @param whilteListed: optional whitelist function which can filter out script tags which are not processed
     * defaults to the standard jsf.js exclusion (we use this code for myfaces)
     */
    runScripts(whilteListed: (val: string) => boolean): DomQuery;

    /**
     * runs the embedded css
     */
    runCss(): DomQuery;

    /**
     * fires a click event on the underlying dom elements
     */
    click(): DomQuery;

    /**
     * adds an event listener
     *
     * @param type
     * @param listener
     * @param options
     */
    addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | EventListenerOptions): DomQuery;

    /**
     * removes an event listener
     *
     * @param type
     * @param listener
     * @param options
     */
    removeEventListener(type: string, listener: (evt: Event) => void, options?: boolean | EventListenerOptions): DomQuery;

    /**
     * fires an event
     */
    fireEvent(eventName: string): void;

    /*
     * pushes  in optionally a new textContent, and/or returns the current text content
     */
    textContent(joinstr?: string): string;

    /*
     * pushes  in optionally a new innerText, and/or returns the current innerText
     */
    innerText(joinstr?: string): string;

    /**
     * encodes all input elements properly into respective
     * config entries, this can be used
     * for legacy systems, for newer usecases, use the
     * HTML5 Form class which all newer browsers provide
     *
     * @param toMerge optional config which can be merged in
     * @return a copy pf
     */
    encodeFormElement(toMerge): Config;

    /**
     * fetches the subnodes from ... to..
     * @param from
     * @param to
     */
    subNodes(from: number, to?: number): DomQuery;
}
```

* usage example

```Typescript
 let probe2 = DomQuery.querySelectorAll("div")
                      .filter(item => item.id.match((id) => id != "id_1"));

 expect(probe2.length == 3);
```


### Stream

The idea is to have streams like java does for arrays.
(forEach, filter etc...)


#### Details

The streams are heavily influenced by the java streams.
Currently two type of Streams are implemented
* Early Streams (Streams)

The default (working already)
a simple implementation of early evaluating streams 
 
* Lazy Streams (LazyStreams)
Laziily evaluating streams, aka elements are processed at the latest possible
stage, this is the default in Java. The advantage of those is
you basically can process endless data without any impact on ram.
Hence there is a set of Data Providers implemented and a general
DataProvider interface available.

#### API

```Typescript
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
    flatMap<R>(fn?: StreamMapper<T>): IStream<R>;

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
    reduce(fn: Reducable<T>, startVal: T): Optional<T>;

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
     * sort on the stream, this is a special case
     * of an endpoint, so your data which is fed in needs
     * to be limited otherwise it will fail
     * it still returns a stream for further processing
     *
     * @param comparator
     */
    sort(comparator: Comparator<T>): IStream<T>;


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
     * Limits the stream to a certain number of elements
     *
     * @param end the limit of the stream
     */
    limits(end: number): IStream<T>;

    /**
     * returns the stream collected into an array (90% use-case abbreviation
     */
    value: Array<T>;
}
```

Ojects of type IStream are exposed at various points in the system

DomQuery exposes it via get stream and get lazyStream

LazyStream and Stream  have static of creation methods
to support the stream creation frm various data types
and data sources.


#### Usage


```Typescript
beforeEach(function () {
        this.probe = [1, 2, 3, 4, 5];
});

it("must have a correct first last lazy", function () {
    let stream = LazyStream.of<number>(...this.probe);

    let first = LazyStream.of<number>(...this.probe).filter((data) => data != 5).onElem((data) => {
        data;
    }).first().value;
    let last = Stream.of<number>(...this.probe).filter((data) => data != 5).onElem((data) => {
        data;
    }).last().value;
    expect(first).to.eq(1);
    expect(last).to.eq(4);
);
```

Or in conjunction with DomQuery

```Typescript
let searchRoot = DomQuery.querySelectorAll("input[type='hidden']")
let formWindowId: Optional<string> = searchRoot
                    .stream
                    .map<string>(getValue)
                    .reduce(doubleCheck, INIT); 

let otherStream = LazyStream.ofDataSource(searchRoot);
```

See  [StreamTest.ts](https://github.com/werpu/mona-dish/blob/master/src/test/typescript/StreamTest.ts) in the test sources directory
 for additional examples
 
### DomQuery and Shadow doms...

Note this is a work in progress.
* At the time of writing a draft of shadow dom support made it into
DomQuery.
* By using a deep parameter on byId or byTagName the search is embedded
into embedded shadow doms.

* Also a method querySelectorallDeep does the same for the provided querySelector 

* Futhermore the standard query selector got a /shadow/ pseudo query element
to mark a hard shadow dom boundary

* DomQuery also got an attachShadow method for creating shadow doms
 

### XmlQuery

similar to DomQuery but atm without a full query engine behind it,
the reason for that is that the browsers do not have a universal query engine yet
and I tried to avoid third party dependencies.
But you get many other benefits similar to DomQuery by using XmlQuery

### Messaging

A messaging bus ... for documentation [follow this link:](https://github.com/werpu/mona-dish/blob/master/docs/Messaging.md)

## Extended Documentation

I am going to provide extended documentation on the various
aspects of mona-dish in following supagages

* [Streams](https://github.com/werpu/mona-dish/blob/master/docs/Stream.md)

## Examples

Various usage examples can be found in the tests:

* [DomQuery, XmlQuery](https://github.com/werpu/mona-dish/blob/master/src/test/typescript/DomQueryTest.ts)
* [Optional, ValueEmbedder, Config](https://github.com/werpu/mona-dish/blob/master/src/test/typescript/MonadTest.ts)
* [Promise](https://github.com/werpu/mona-dish/blob/master/src/test/typescript/PromiseTest.ts)
* [Stream](https://github.com/werpu/mona-dish/blob/master/src/test/typescript/StreamTest.ts)
                   
                   