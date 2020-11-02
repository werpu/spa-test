import singleSpaHtml from "single-spa-html"; // single-spa helper
import tpl1 from "./template.html"; // html template is separated out so that we can get better syntax highlighting
import tpl2 from "./hello.html"; // html template is separated out so that we can get better syntax highlighting
import "./styles.css"; // styles are global so these are based on IDs
console.log("loadrd")

var prepare = () => {
    console.log("getter called");
    const id = "single-spa-application:@example/cookie-consent";
    console.log(id);
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement("div");
        el.id = id;
        document.body.prepend(el); // single-spa automatically _appends_, but this content should be _prepended_ for accessibility
    }
    return el;
};

const htmlLifecycles = singleSpaHtml({
    getDomElementGetter: prepare,
    template: tpl1
});


const htmlLifecyclesFull = singleSpaHtml({
    getDomElementGetter: prepare,
    template: tpl2
});

export const mount = (props) => {
    console.log("mountt");
    return localStorage.getItem("cookie-consent") // look for value; this could instead be a cookie if you wanted to send it back and forth to your server.
        ? htmlLifecyclesFull.mount(props).then(() => {
        }) // don't render anything if they have already "consented"
        : htmlLifecycles.mount(props).then(() => {
            // extend single-spa mount lifecycle; after single-spa has mounted the template, enhance with plain JavaScript
            const dialog = document.querySelector(`#cookie-consent`), // get outermost node
                noSellCheckbox =
                    dialog && dialog.querySelector("#cookie-consent-no-sell"), // get checkbox node
                acceptBtn = dialog && dialog.querySelector("#cookie-consent-accept"); // get button node

            if (!dialog || !noSellCheckbox || !acceptBtn) return;

            acceptBtn.addEventListener("click", () => {
                // bind and handle click event on button
                const consent = {
                    date: new Date().toJSON(),
                    noSell: noSellCheckbox.checked,
                };
                localStorage.setItem("cookie-consent", JSON.stringify(consent));
                dialog.classList.add("hide"); // add hidden class to animate out
            });

            setTimeout(() => dialog.classList.remove("hide")); // dialog starts out with 'h' (hidden) class; this removes it so that it animates in.

            dialog.addEventListener("transitionend", () => {
                // listen for when animation ends and set hidden attribute
                dialog.classList.contains("hide") &&
                dialog.setAttribute("hidden", "");
            });
        });
};

export const {bootstrap, unmount} = htmlLifecycles; // export other lifecycles as-is
