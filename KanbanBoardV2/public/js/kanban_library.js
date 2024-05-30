//  #######################################################################################################
//  PURPOSE		: Universal 'all-in-one' function that unites the DOM-functions
//                => document.getElementById
//                => document.getElementsByTagName
//                => document.getElementsByClassName
//                => document.getElementsByName
//                => document.querySelectorAll
//   			  
//  PARAMETER 	: selector 	= ID | classname | .class | [type] | >sub-element or <tag>
//                            if ID is not found as a valid selector, search continues 
//                            in the order: HTML-tags ==> classNames ===> names
//                            So if there is no ID matching to 'selector' but a valid
//                            HTML-tag or a class, they will be returned
//  			: [child]           	=   optional. Ignored if valid ID was found!
//              : omitted               =   a node list or HTML-collection will be returned!
//              : '~' or ':last-child'  =   returns the last child of the nodelist
//              : 0                     =   returns the first child of the nodelist
//              : number | numeric string = child[number] will be returned
//  			
//  RETURNS 	: a single element (if selector is a valid ID or child is specified)
//                in all other cases a zero-based nodelist or HTML-collection,
//                matching the selector-parameter
//                If the list contains ONLY ONE element, this element is returned only!
//
//  CALL        : $('main-content')     -   returns an element with ID 'main-content'
//                $('div','~')          -   returns the last div-container of the document
//                $('a',0)              -   returns the first link (<a>-element)
//                $('div.myClass')      -   returns a list with all div's containing class 'myClass'
//                $('div.myClass','~')  -   returns last div containing class 'myClass'
//                $('.clsNames',3)      -   returns the 4th(!) child of the wanted class list
//                $('input[type=text]') -   returns a list with all input elements, being text fields
//                $('[name]')           -   returns a list with all elements, having a 'name' attribute
//  #######################################################################################################
// prepend 'export' if you wanna import the function in a module 
function $(selector, child) {
    let clsNames;
    // is last-child wanted?
    let getLastChild = (child == '~' || child == ':last-child') ? true : false;
    // check, if 'child' is numeric!
    if (!isNumeric(child, true) || child < 0) { child = false }

    // query-selector provided?
    if (selector.includes('[') || selector.includes('.') || selector.includes('#') || selector.includes(':') || selector.includes('>')) {
        let elements = document.querySelectorAll(selector);
        if (elements.length == 1) { return elements[0] }
        child = getLastChild ? elements.length - 1 : child;
        return (child === false) ? elements : elements[child];
    }

    // now search for ID...
    let element = document.getElementById(selector);
    if (element) { // ID was found!
        return element;
    } else { // no ID found: continue in HTML-tags...
        let htmlTags = document.getElementsByTagName(selector);
        if (htmlTags.length > 0) {
            // don't return a collection or list, if only 1 child is contained, 
            // return this single element instead
            if (htmlTags.length == 1) { return htmlTags[0] }
            child = getLastChild ? htmlTags.length - 1 : child;
            return (child === false) ? htmlTags : htmlTags[child];
        } else { // is the selector a class...?            
            clsNames = document.getElementsByClassName(selector);
            if (clsNames.length > 0) {
                if (clsNames.length == 1) { return clsNames[0] }
                child = getLastChild ? clsNames.length - 1 : child;
                return (child === false) ? clsNames : clsNames[child];
            } else {
                // ...or is it a name finally?
                let elNames = document.getElementsByName(selector);
                if (elNames.length > 0) {
                    if (elNames.length == 1) { return elNames[0] }
                    child = getLastChild ? elNames.length - 1 : child;
                    return (child === false) ? elNames : elNames[child];
                }
            }
        }
    }
}

//  #####################################################################################
//  PURPOSE 	: Checks properly(!!!), if 'expression' is numeric
//   			  recognizes: undefined, NaN, Null, infinity etc.
//  PARAMETER 	: expression    -   expression to be ckecked
//              : [strAllowed]  -   boolean, optional
//                                  tells if string literals are allowed or not (default)
//  RETURNS 	: true | false
//  #####################################################################################
// prepend 'export' if you wanna import the function in a module 
// export function isNumeric(expression, strAllowed) { 
function isNumeric(expression, strAllowed) {
    if (!strAllowed) {
        return Number.isFinite(expression);
    } else {
        return Number.isFinite(parseFloat(expression));
    }

}

async function includeHTML () {
    // let includeElements = $('[w3-include-html]'); // = document.querySelectorAll('[w3-include-html]')
    let includeElements = document.querySelectorAll('[w3-include-html]')
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute('w3-include-html'),
            resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found.';
        }        
    }
}
    
// returns the current date
function today (format = 'dd.mm.yyyy') {
    return format$(new Date(Date.now()),format);
}

/**
 * format$ (datum, "hh:nn:ss") yyyy-mm-dd
 * @param {expression} expression 
 * @param {format} format 
 * @returns 
 */
function format$(expression, format = 'dd.mm.yyyy') {
    let d = (expression instanceof Date) ? expression : expression.isDate();
    if (!d) return 'Invalid Date';

    // get all parts of the date with leading zero
    let month = ('0' + (d.getMonth() + 1)).slice(-2),
        day = ('0' + d.getDate()).slice(-2),
        year = d.getFullYear(),
        hours = ('0' + d.getHours()).slice(-2),
        min = ('0' + d.getMinutes()).slice(-2),
        sec = ('0' + d.getSeconds()).slice(-2);

    // is time wanted?
    if (format.includes(':')) {
        return format.replace('hh', hours).replace('nn', min).replace('ss', sec);
    }
    return format.replace('mm', month).replace('yyyy', year).replace('dd', day);
}

/**
 * extends String-object by this function:
 * checks if a given date-string can be interpreted as date!
 * valid separators are: '.' | '-' | '/'
 * call: '17-01-2000'.isDate()              = true, returns the date as object!
 *       let date = '2000/01/17'.isDate()   = true, assigns the date to the variable!
 * @param {expression} expression 
 * @returns 
 */
String.prototype.isDate = function(expression) {
    // assign this to the expression, if function is attended on a string!
    if (!expression) expression = this;

    const dateReg = /^\d{1,2}|\d{4}([-\/\.])\d{1,2}\1\d{2,4}$/
    if (!expression.match(dateReg)) return false;

    let dtParts = expression.split(/[\.\-\/]/),
        yyyy = parseInt(dtParts[2]),
        mm = parseInt(dtParts[1]),
        dd = parseInt(dtParts[0]),
        separator = getDateSeparator(expression);

    // swap the year and day if format is like: yyyy-mm-dd
    if (expression.indexOf(separator) == 4) {
        [dd, yyyy] = [yyyy, dd];
    }

    let tmpDate = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);

    // if we found a valid date, return it, otherwise return 'false'!
    if (mm === (tmpDate.getMonth() + 1) && dd === tmpDate.getDate() && yyyy === tmpDate.getFullYear()) return tmpDate;
    // this would return just 'true':
    // return mm === (tmpDate.getMonth() + 1) && dd === tmpDate.getDate() && yyyy === tmpDate.getFullYear();
    return false;
}

/**
 * 
 * @param {string} path including the required filename
 * @returns {string} the filename  
 */
String.prototype.getFileName = function (path) {
    if (!path) path = this;
    return path.replace(/^.*[\\\/]/, '');
}

/**
 * helper function for fnc 'String.prototype.isDate'
 * determines which seperator is used for the given date: '/' or '-' or '.' ?
 * @param {date} date 
 * @returns 
 */
function getDateSeparator(date) {
    const separators = ['/', '-', '.']; // define all possible date separators
    for (let i = 0; i < separators.length; i++) {
        const sep = separators[i];
        if (date.split(sep).length > 1) return sep;
    }
    return undefined;
}

/**
 * get random
 * @param {min} min 
 * @param {max} max 
 * @returns 
 */
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * functions for sound and music output
 * @param {file} file 
 * @param {forced} forced 
 */
function playSound(file, forced = true) {
    // if (soundEnabled || musicEnabled || forced) { // when available in settings
    if (forced) {
        file = './sound/' + file;
        let audio = new Audio(file);
        audio.play();
    }
}

/**
 * display a messagebox 
 * @param {message for the user} message 
 */
function todo(message) {
    playSound('notify.mp3');
    msgBox(message, 'Info @ authors', 'Ok', false, true);
}