/**
 * beginning custom tag support
 *
 * This api is still experimental
 * and might be interwoven with DomQuery
 * so it is bound to change
 *
 * it follows a builder pattern to allow easier creations
 * with less code of custom tags
 */
export declare class TagBuilder {
    tagName: string;
    connectedCallback?: Function;
    clazz?: CustomElementConstructor;
    extendsType: CustomElementConstructor;
    theOptions: ElementDefinitionOptions | null;
    markup: string;
    disconnectedCallback?: Function;
    adoptedCallback?: Function;
    attributeChangedCallback?: Function;
    observedAttrs: string[];
    static withTagName(tagName: any): TagBuilder;
    constructor(tagName: string);
    withObservedAttributes(...oAttrs: any[]): void;
    withConnectedCallback(callback: Function): this;
    withDisconnectedCallback(callback: Function): this;
    withAdoptedCallback(callback: Function): this;
    withAttributeChangedCallback(callback: Function): this;
    withExtendsType(extendsType: CustomElementConstructor): this;
    withOptions(theOptions: any): this;
    withClass(clazz: any): this;
    withMarkup(markup: any): this;
    register(): void;
}
