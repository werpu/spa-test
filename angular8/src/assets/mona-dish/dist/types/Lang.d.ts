import { Optional } from "./Monad";
/**
 * Lang helpers crossported from the apache myfaces project
 */
export declare module Lang {
    /**
     * helper function to savely resolve anything
     * this is not an elvis operator, it resolves
     * a value without exception in a tree and if
     * it is not resolvable then an optional of
     * a default value is restored or Optional.empty
     * if none is given
     *
     * usage
     * <code>
     *     let var: Optiona<string> = saveResolve(() => a.b.c.d.e, "foobaz")
     * </code>
     *
     * @param resolverProducer a lambda which can produce the value
     * @param defaultValue an optional default value if the producer failes to produce anything
     * @returns an Optional of the produced value
     */
    function saveResolve<T>(resolverProducer: () => T, defaultValue?: T): Optional<T>;
    function saveResolveLazy<T>(resolverProducer: () => T, defaultValue?: () => T): Optional<T>;
    /**
     * String to array function performs a string to array transformation
     * @param {String} it the string which has to be changed into an array
     * @param {RegExp} splitter our splitter reglar expression
     * @return a trimmed array of the splitted string
     */
    function strToArray(it: string, splitter?: string | RegExp): Array<string>;
    /**
     * hyperfast trim
     * http://blog.stevenlevithan.com/archives/faster-trim-javascript
     * crossported from dojo
     */
    function trim(str: string): string;
    /**
     * generic object arrays like dom definitions to array conversion method which
     * transforms any object to something array like
     * @param obj
     * @param offset
     * @param pack
     * @returns an array converted from the object
     */
    function objToArray<T>(obj: any, offset?: number, pack?: Array<T>): Array<T>;
    /**
     * equalsIgnoreCase, case insensitive comparison of two strings
     *
     * @param source
     * @param destination
     */
    function equalsIgnoreCase(source?: string, destination?: string): boolean;
    /**
     * runtime type assertion
     *
     * @param probe the probe to be tested for a type
     * @param theType the type to be tested for
     */
    function assertType(probe: any, theType: any): boolean;
    /**
     * Backported from dojo
     * a failsafe string determination method
     * (since in javascript String != "" typeof alone fails!)
     * @param it {|Object|} the object to be checked for being a string
     * @return true in case of being a string false otherwise
     */
    function isString(it?: any): boolean;
    function isFunc(it: any): boolean;
    function objAssign(target: any, ...theArgs: any): any;
}
