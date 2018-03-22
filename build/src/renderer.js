"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var microReact_1 = require("microReact");
var util_1 = require("./util");
var client_1 = require("./client");
;
;
function isInputElem(elem) {
    return elem && elem.tagName === "INPUT";
}
function isSelectElem(elem) {
    return elem && elem.tagName === "SELECT";
}
function setActiveIds(ids) {
    for (var k in exports.activeIds) {
        exports.activeIds[k] = undefined;
    }
    for (var k in ids) {
        exports.activeIds[k] = ids[k];
    }
}
exports.setActiveIds = setActiveIds;
//---------------------------------------------------------
// MicroReact-based record renderer
//---------------------------------------------------------
exports.renderer = new microReact_1.Renderer();
document.body.appendChild(exports.renderer.content);
exports.renderer.content.classList.add("application-root");
// These will get maintained by the client as diffs roll in
exports.sentInputValues = {};
exports.activeIds = {};
// root will get added to the dom by the program microReact element in renderEditor
exports.activeElements = { "root": document.createElement("div") };
exports.activeElements.root.className = "program";
// Obtained from http://w3c.github.io/html-reference/elements.html
var supportedTagsArr = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "command",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "map",
    "mark",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
];
// Obtained from https://www.w3.org/TR/SVG/eltindex.html
var svgsArr = [
    // we can't have tags in both the html set and the svg set
    // "a",
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animate",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "color-profile",
    "cursor",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignObject",
    "g",
    "glyph",
    "glyphRef",
    "hkern",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "missing-glyph",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "script",
    "set",
    "stop",
    "style",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tref",
    "tspan",
    "use",
    //"view",
    "vkern"
];
supportedTagsArr.push.apply(supportedTagsArr, svgsArr);
function toKeys(arr) {
    var obj = {};
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var el = arr_1[_i];
        obj[el] = true;
    }
    return obj;
}
var supportedTags = toKeys(supportedTagsArr);
var svgs = toKeys(svgsArr);
// Map of input entities to a queue of their values which originated from the client and have not been received from the server yet.
var lastFocusPath = null;
var selectableTypes = { "": true, undefined: true, text: true, search: true, password: true, tel: true, url: true };
var previousCheckedRadios = {};
function insertSorted(parent, child) {
    var current;
    for (var curIx = 0; curIx < parent.childNodes.length; curIx++) {
        var cur = parent.childNodes[curIx];
        if (cur.sort !== undefined && cur.sort > child.sort) {
            current = cur;
            break;
        }
    }
    if (current) {
        parent.insertBefore(child, current);
    }
    else {
        parent.appendChild(child);
    }
}
var _suppressBlur = false; // This global is set when the records are being re-rendered, to prevent false blurs from mucking up focus tracking.
function renderRecords() {
    _suppressBlur = true;
    var lastActiveElement = null;
    if (document.activeElement && document.activeElement.entity) {
        lastActiveElement = document.activeElement;
    }
    var records = client_1.indexes.records.index;
    var dirty = client_1.indexes.dirty.index;
    var activeClasses = client_1.indexes.byClass.index || {};
    var activeStyles = client_1.indexes.byStyle.index || {};
    var activeChildren = client_1.indexes.byChild.index || {};
    var regenClassesFor = [];
    var regenStylesFor = [];
    for (var entityId in dirty) {
        var entity = records[entityId];
        var elem = exports.activeElements[entityId];
        if (dirty[entityId].indexOf("tag") !== -1) {
            var values = entity.tag || [];
            var tag = void 0;
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var val = values_1[_i];
                if (supportedTags[val]) {
                    if (tag)
                        console.error("Unable to set 'tag' multiple times on entity", entity, entity.tag);
                    tag = val;
                }
            }
            if (!tag && elem && elem !== exports.activeElements.root) {
                var parent_1 = elem.parentNode;
                if (parent_1)
                    parent_1.removeChild(elem);
                elem = exports.activeElements[entityId] = null;
            }
            else if (tag && elem && elem.tagName !== tag.toUpperCase()) {
                var parent_2 = elem.parentNode;
                if (parent_2)
                    parent_2.removeChild(elem);
                if (svgs[tag]) {
                    elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
                }
                else {
                    elem = document.createElement(tag || "div");
                }
                // Mark all attributes of the entity dirty to rerender them into the new element
                for (var attribute in entity) {
                    if (dirty[entityId].indexOf(attribute) == -1) {
                        dirty[entityId].push(attribute);
                    }
                }
                elem.entity = entityId;
                exports.activeElements[entityId] = elem;
                if (entity.sort && entity.sort.length > 1)
                    console.error("Unable to set 'sort' multiple times on entity", entity, entity.sort);
                if (entity.sort !== undefined && entity.sort[0] !== undefined) {
                    elem.sort = entity.sort[0];
                }
                else if (entity["eve-auto-index"] !== undefined && entity["eve-auto-index"][0] !== undefined) {
                    elem.sort = entity["eve-auto-index"][0];
                }
                else {
                    elem.sort = "";
                }
                if (parent_2)
                    insertSorted(parent_2, elem);
            }
            else if (tag && !elem) {
                if (svgs[tag]) {
                    elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
                }
                else {
                    elem = document.createElement(tag || "div");
                }
                elem.entity = entityId;
                exports.activeElements[entityId] = elem;
                if (entity.sort && entity.sort.length > 1)
                    console.error("Unable to set 'sort' multiple times on entity", entity, entity.sort);
                if (entity.sort !== undefined && entity.sort[0] !== undefined) {
                    elem.sort = entity.sort[0];
                }
                else if (entity["eve-auto-index"] !== undefined && entity["eve-auto-index"][0] !== undefined) {
                    elem.sort = entity["eve-auto-index"][0];
                }
                else {
                    elem.sort = "";
                }
                var parent_3 = exports.activeElements[activeChildren[entityId] || "root"];
                if (parent_3)
                    insertSorted(parent_3, elem);
            }
        }
        if (activeClasses[entityId]) {
            for (var _a = 0, _b = activeClasses[entityId]; _a < _b.length; _a++) {
                var entId = _b[_a];
                regenClassesFor.push(entId);
            }
        }
        else if (activeStyles[entityId]) {
            for (var _c = 0, _d = activeStyles[entityId]; _c < _d.length; _c++) {
                var entId = _d[_c];
                regenStylesFor.push(entId);
            }
        }
        if (!elem)
            continue;
        for (var _e = 0, _f = dirty[entityId]; _e < _f.length; _e++) {
            var attribute = _f[_e];
            var value = entity[attribute];
            if (attribute === "children") {
                if (!value) {
                    while (elem.lastElementChild) {
                        elem.removeChild(elem.lastElementChild);
                    }
                }
                else {
                    var children = (value && util_1.clone(value)) || [];
                    // Remove any children that no longer belong
                    for (var ix = elem.childNodes.length - 1; ix >= 0; ix--) {
                        if (!(elem.childNodes[ix] instanceof Element))
                            continue;
                        var child = elem.childNodes[ix];
                        var childIx = children.indexOf(child.entity);
                        if (childIx == -1) {
                            elem.removeChild(child);
                            child._parent = null;
                        }
                        else {
                            children.splice(childIx, 1);
                        }
                    }
                    // Add any new children which already exist
                    for (var _g = 0, children_1 = children; _g < children_1.length; _g++) {
                        var childId = children_1[_g];
                        var child = exports.activeElements[childId];
                        if (child) {
                            insertSorted(elem, child);
                        }
                    }
                }
            }
            else if (attribute === "class") {
                regenClassesFor.push(entityId);
            }
            else if (attribute === "style") {
                regenStylesFor.push(entityId);
            }
            else if (attribute === "text") {
                elem.textContent = (value && value.join(", ")) || "";
            }
            else if (attribute === "value") {
                var input = elem;
                if (!value || !value.length || !value[0]) {
                    input.value = "";
                    input.setAttribute("value", "");
                }
                else if (value.length > 1) {
                    console.error("Unable to set 'value' multiple times on entity", entity, JSON.stringify(value));
                }
                else {
                    input.setAttribute('value', value[0]);
                }
            }
            else if (attribute === "checked") {
                if (value && value.length > 1) {
                    console.error("Unable to set 'checked' multiple times on entity", entity, value);
                }
                else if (value && value[0]) {
                    elem.setAttribute("checked", "true");
                    if (elem.getAttribute("type") == "radio") {
                        var name = elem.getAttribute("name") || "";
                        previousCheckedRadios[name] = entityId;
                    }
                }
                else {
                    elem.removeAttribute("checked");
                }
            }
            else {
                value = value && value.join(", ");
                if (value === undefined) {
                    elem.removeAttribute(attribute);
                }
                else {
                    elem.setAttribute(attribute, value);
                }
            }
        }
        var attrs = Object.keys(entity);
    }
    for (var _h = 0, regenClassesFor_1 = regenClassesFor; _h < regenClassesFor_1.length; _h++) {
        var entityId = regenClassesFor_1[_h];
        var elem = exports.activeElements[entityId];
        if (!elem)
            continue;
        var entity = records[entityId];
        var value = entity["class"];
        if (!value) {
            elem.className = "";
        }
        else {
            var neue = [];
            for (var _j = 0, value_1 = value; _j < value_1.length; _j++) {
                var klassId = value_1[_j];
                if (activeClasses[klassId] !== undefined && records[klassId] !== undefined) {
                    var klass = records[klassId];
                    for (var name_1 in klass) {
                        if (!klass[name_1])
                            continue;
                        if (klass[name_1].length > 1) {
                            console.error("Unable to set class attribute to multiple values on entity", entity, name_1, klass[name_1]);
                            continue;
                        }
                        if (klass[name_1][0] && neue.indexOf(name_1) === -1) {
                            neue.push(name_1);
                        }
                    }
                }
                else {
                    neue.push(klassId);
                }
            }
            elem.className = neue.join(" ");
        }
    }
    for (var _k = 0, regenStylesFor_1 = regenStylesFor; _k < regenStylesFor_1.length; _k++) {
        var entityId = regenStylesFor_1[_k];
        var elem = exports.activeElements[entityId];
        if (!elem)
            continue;
        var entity = records[entityId];
        var value = entity["style"];
        elem.removeAttribute("style"); // @FIXME: This could be optimized to care about the diff rather than blowing it all away
        if (value) {
            var neue = [];
            for (var _l = 0, value_2 = value; _l < value_2.length; _l++) {
                var styleId = value_2[_l];
                if (activeStyles[styleId]) {
                    var style = records[styleId];
                    for (var attr in style) {
                        elem.style[attr] = style[attr] && style[attr].join(", ");
                    }
                }
                else {
                    neue.push(styleId);
                }
            }
            if (neue.length) {
                var s = elem.getAttribute("style");
                elem.setAttribute("style", (s ? (s + "; ") : "") + neue.join("; "));
            }
        }
    }
    if (lastFocusPath && lastActiveElement && isInputElem(lastActiveElement)) {
        var current = exports.activeElements.root;
        var ix = 0;
        for (var _m = 0, lastFocusPath_1 = lastFocusPath; _m < lastFocusPath_1.length; _m++) {
            var segment = lastFocusPath_1[_m];
            current = current.childNodes[segment];
            if (!current) {
                lastActiveElement.blur();
                lastFocusPath = null;
                break;
            }
            ix++;
        }
        if (current && current.entity !== lastActiveElement.entity) {
            var curElem = current;
            curElem.focus();
            if (isInputElem(lastActiveElement) && isInputElem(current) && selectableTypes[lastActiveElement.type] && selectableTypes[current.type]) {
                current.setSelectionRange(lastActiveElement.selectionStart, lastActiveElement.selectionEnd);
            }
        }
    }
    _suppressBlur = false;
}
exports.renderRecords = renderRecords;
//---------------------------------------------------------
// Event bindings to forward events to the server
//---------------------------------------------------------
function addSVGCoods(elem, event, eveEvent) {
    if (elem.tagName != "svg")
        return;
    var pt = elem.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    var coords = pt.matrixTransform(elem.getScreenCTM().inverse());
    eveEvent.x = coords.x;
    eveEvent.y = coords.y;
}
function addRootEvent(elem, event, objs, eventName) {
    if (elem !== exports.activeElements["root"])
        return;
    var eveEvent = {
        tag: objs.length === 0 ? [eventName] : [eventName, "direct-target"],
        root: true,
        x: event.clientX,
        y: event.clientY
    };
    objs.push(eveEvent);
}
window.addEventListener("click", function (event) {
    var target = event.target;
    var current = target;
    var objs = [];
    while (current) {
        if (current.entity) {
            var tag = ["click"];
            if (current == target) {
                tag.push("direct-target");
            }
            var eveEvent = { tag: tag, element: current.entity };
            addSVGCoods(current, event, eveEvent);
            objs.push(eveEvent);
        }
        addRootEvent(current, event, objs, "click");
        current = current.parentElement;
    }
    client_1.client.sendEvent(objs);
    if (target.tagName === "A") {
        var elem = target;
        // Target location is internal, so we need to rewrite it to respect the IDE's hash segment structure.
        if (elem.href.indexOf(location.origin) === 0) {
            var relative = elem.href.slice(location.origin.length + 1);
            if (relative[0] === "#")
                relative = relative.slice(1);
            var currentHashChunks = location.hash.split("#").slice(1);
            var ideHash = currentHashChunks[0];
            if (ideHash[ideHash.length - 1] === "/")
                ideHash = ideHash.slice(0, -1);
            var modified = "#" + ideHash + "/#" + relative;
            location.hash = modified;
            event.preventDefault();
        }
    }
});
window.addEventListener("dblclick", handleBasicEventWithTarget("double-click"));
window.addEventListener("mousedown", handleBasicEventWithTarget("mousedown"));
window.addEventListener("mouseup", handleBasicEventWithTarget("mouseup"));
window.addEventListener("input", function (event) {
    var target = event.target;
    if (target.entity) {
        if (!exports.sentInputValues[target.entity]) {
            exports.sentInputValues[target.entity] = [];
        }
        exports.sentInputValues[target.entity].push(target.value);
        client_1.client.sendEvent([{ tag: ["change"], element: target.entity, value: target.value }]);
    }
});
window.addEventListener("change", function (event) {
    var target = event.target;
    if (target.tagName == "TEXTAREA")
        return;
    if (target.tagName == "INPUT") {
        var type = target.getAttribute("type");
        if (type != "checkbox" && type != "radio")
            return;
        var tickbox = target;
        if (!tickbox.entity)
            return;
        client_1.client.sendEvent([{ tag: ["change", "direct-target"], element: tickbox.entity, checked: tickbox.checked }]);
        if (type == "radio") {
            var name = target.getAttribute("name") || "";
            if (name in previousCheckedRadios) {
                var previousEntity = previousCheckedRadios[name];
                client_1.client.sendEvent([{ tag: ["change"], element: previousEntity, checked: false }]);
            }
        }
    }
    else if (target.entity) {
        if (!exports.sentInputValues[target.entity]) {
            exports.sentInputValues[target.entity] = [];
        }
        var value = target.value;
        if (isSelectElem(target)) {
            value = target.options.item(target.selectedIndex).value;
        }
        exports.sentInputValues[target.entity].push(value);
        var tag = ["change"];
        if (target == target) {
            tag.push("direct-target");
        }
        client_1.client.sendEvent([{ tag: tag, element: target.entity, value: target.value }]);
    }
});
function getFocusPath(target) {
    var root = exports.activeElements.root;
    var current = target;
    var path = [];
    while (current !== root && current && current.parentElement) {
        var parent_4 = current.parentElement;
        path.unshift(Array.prototype.indexOf.call(parent_4.children, current));
        current = parent_4;
    }
    return path;
}
function handleBasicEventWithTarget(name) {
    return function (event) {
        var target = event.target;
        var current = target;
        var objs = [];
        while (current) {
            if (current.entity) {
                var tag = [name];
                if (current == target) {
                    tag.push("direct-target");
                }
                var eveEvent = { tag: tag, element: current.entity };
                addSVGCoods(current, event, eveEvent);
                objs.push(eveEvent);
            }
            addRootEvent(current, event, objs, name);
            current = current.parentElement;
        }
        client_1.client.sendEvent(objs);
    };
}
window.addEventListener("focus", function (event) {
    var target = event.target;
    if (target.entity) {
        var objs = [{ tag: ["focus"], element: target.entity }];
        client_1.client.sendEvent(objs);
        lastFocusPath = getFocusPath(target);
    }
}, true);
window.addEventListener("blur", function (event) {
    if (_suppressBlur) {
        event.preventDefault();
        return;
    }
    var target = event.target;
    if (target.entity) {
        var objs = [{ tag: ["blur"], element: target.entity }];
        client_1.client.sendEvent(objs);
        if (lastFocusPath) {
            var curFocusPath = getFocusPath(target);
            if (curFocusPath.length === lastFocusPath.length) {
                var match = true;
                for (var ix = 0; ix < curFocusPath.length; ix++) {
                    if (curFocusPath[ix] !== lastFocusPath[ix]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    lastFocusPath = null;
                }
            }
        }
    }
}, true);
var keyMap = { 13: "enter", 27: "escape" };
window.addEventListener("keydown", function (event) {
    var target = event.target;
    var current = target;
    var objs = [];
    var key = event.keyCode;
    while (current) {
        if (current.entity) {
            var tag = ["keydown"];
            if (current == target) {
                tag.push("direct-target");
            }
            objs.push({ tag: tag, element: current.entity, key: keyMap[key] || key });
        }
        current = current.parentElement;
    }
    objs.push({ tag: ["keydown"], element: "window", key: key });
    client_1.client.sendEvent(objs);
});
window.addEventListener("keyup", function (event) {
    var target = event.target;
    var current = target;
    var objs = [];
    var key = event.keyCode;
    while (current) {
        if (current.entity) {
            var tag = ["keyup"];
            if (current == target) {
                tag.push("direct-target");
            }
            objs.push({ tag: tag, element: current.entity, key: keyMap[key] || key });
        }
        current = current.parentElement;
    }
    objs.push({ tag: ["keyup"], element: "window", key: key });
    client_1.client.sendEvent(objs);
});
//---------------------------------------------------------
// Editor Renderer
//---------------------------------------------------------
var activeLayers = {};
var editorParse = {};
var allNodeGraphs = {};
var showGraphs = false;
function injectProgram(node, elem) {
    node.appendChild(exports.activeElements.root);
}
function renderEve() {
    exports.renderer.render([{ c: "application-container", postRender: injectProgram }]);
}
exports.renderEve = renderEve;
//# sourceMappingURL=renderer.js.map