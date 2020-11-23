# this is a small multi project single-spa app

The main reason for the existence of this project is
that I want to test how  various angular applications behave among each other!


#Additional information
## setup in angular... dont use the standard getting started
multi module documentation, it produces a non working project
simply use this application as a starter or a third party github project
doing that.

## transforming an angular app for single spa

The transformation process leaves a non working angular project
which does not work standalone anymore.
The angular8 project has fixed this and it can be started
as both either as single spa or as standalone application

The fix simply was to extend the angular.json to allow a double build
triggering different main.ts files 
for that two tsconfig files must be provided
one triggering the main.ts the other one the main.single.spa.ts file
as root file.

Following changes in the angular.json were performed


```json
 "projects": {
    "ang-app2": {
    
    ..
     "configurations": {
            "server": {
              "fileReplacements": [
                {
                  "replace": "src/main.single-spa.ts",
                  "with": "src/main.ts"
                },
                {
                  "replace": "tsconfig.app.json",
                  "with": "tsconfig.json"
                }

     ""
    ....
    "serve": {
      "configurations": {
              "server": {
                "browserTarget": "ang-app2:build:server"
              },
    }
```


So what we have here is a dual configuration over 
the configurations entries:

Theoretically a double build also would be possible...
The simplest way probably is to run two separate builds
and shift the output filename out
(aka single-spa first then rename it and then the normal server build)

Single spa wants to fetch a certain file (aka something like main.js etc..)
which is loaded by systemjs, the name of the file it wants to fetch
can be adjusted on the single spa side.
That way a dual build would be possible without any restrictions

## Messaging

For messaging, the messaging library of the mona-dish project
was used:

https://github.com/werpu/mona-dish

https://github.com/werpu/mona-dish/blob/master/docs/Messaging.md

you can integrate it in two ways

a) via npm npm install mona-dish --save
b) via cdn: 

```html
  <script type="systemjs-importmap">
{
  "imports": {
    "messaging": "https://unpkg.com/mona-dish@0.19.0/dist/js/system/index.js"
  }
}
  </script>
````

Àfter that you have to point the systemjs loader to the library:

````javascript
 Promise.all([System.import('mona-dish')]).then(([monadish]) => {

    const {Broker, Message, Direction} = monadish;

    window.broker = new Broker();
````

Also check out the other tools mona-dish provides
(Streams, jquery like dom query built on top of the 
dom query api, shadow dom support etc...)