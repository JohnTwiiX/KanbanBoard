//  ################################################################################################################
//  PURPOSE:        Displays a modal | modeless dialog with dynamical buttons
//                  Parent function must be ASYNC (!) if you expect a reply from user !!!
//  
//  PARAMETER:      - prompt [optional]     : prompt text
//                  - titel  [optional]     : title bar of the dialog
//                                            if omitted the current document title is used 
//                  - buttons [optional]    : string-array or string sepatated by komma 
//                                            if omitted the default is button [Ok] only
//                  - modal [optional]      : true | false; default = true (modal)
//                  - gradient [optional]   : gradient of the titlebar 
//                                          : true | false; default = false (no gradient)
//
//  RETURNS:        the caption of the clicked button as string
//                  or 'false' in case a non-modal dialog has been clicked outside area
//
//  CALL:           let answer = await msgBox("Do you really want to delete this file?","Confirm","yes,no,cancel")
//                  creates a message box with three buttons [yes] [no] [cancel] that is modal without grdient
//
//                  msgBox ("File has been deleted.")
//                  creates a modal (default!) message box with an [ok] button only, 
//                  using the website's <title>-tag, no gradient
//
//  ################################################################################################################

function msgBox(prompt, title, buttons, modal, gradient) {
    // parse defaults...
    if (prompt === undefined || prompt == null) prompt = '';
    if (title === undefined || title == null || title.trim() == '') {
        title = document.getElementsByTagName("title")[0].innerHTML;
    }
    // box is per default ALWAYS modal!
    if (modal == null) modal = true;

    // set classes either for modal or non-modal dialog
    let classNames = (modal) ? 'msg-overlay msg-dark' : 'msg-overlay';

    // place the messagebox-container in <body> 
    createOverlay(classNames);

    // render buttons first, otherwise the wrapping <div> is going to be closed automatically!
    let btnHTML = renderButtons(buttons);
    // titlebar with gradient ?
    classNames = (gradient) ? 'msg-titlebar msg-gradient' : 'msg-titlebar';

    // now render the box...
    renderBox(prompt, title, btnHTML, classNames);

    // ... and create a promise with an event listener
    return new Promise(function(resolve, reject) {
        document.body.addEventListener('click', function btnEL(event) {
            let clickedOn = event.target.id;
            if (clickedOn.startsWith('btn-')) {
                resolve(document.getElementById(clickedOn).innerHTML);
                removeBox(btnEL);
            } else if (event.target.id == 'msgBoxBG' && !modal) {
                resolve('false');
                removeBox(btnEL);
            }
        });
    });
}

/**
 * removes the event-listener and the whole messagebox itself
 * @param {evListener} evListener 
 */
function removeBox(evListener) {
    document.body.removeEventListener('click', evListener);
    document.getElementById('msgBoxBG').remove();
}

/**
 * creates the dialog wrapper
 * @param {classes} classes 
 */
function createOverlay(classes) {
    let boxParent = document.createElement('div');
    boxParent.setAttribute("id", "msgBoxBG");
    boxParent.setAttribute("class", classes);
    document.body.appendChild(boxParent);
}

/**
 * generates the buttons
 * @param {buttons} buttons 
 * @returns 
 */
function renderButtons(buttons) {
    let arrButtons = parseButtons(buttons);
    let btnCode = '';
    for (let i = 0; i < arrButtons.length; i++) {
        const btn = arrButtons[i];
        btnCode += `<button id="btn-${i+1}" class="msg-button">${btn}</button>`;
    }
    return btnCode;
}

/**
 * parses the submitted buttons
 * could be a simple string, separetd by comma or an array or '' 
 * @param {buttons} buttons 
 * @returns 
 */
function parseButtons(buttons) {
    if (buttons === undefined) {
        buttons = [];
        buttons[0] = 'Ok';
    } else if (!Array.isArray(buttons)) {
        // avoid white spaces!
        if (buttons.trim().length == 0) {
            buttons = [];
            buttons[0] = 'Ok';
        } else {
            buttons = buttons.split(',');
            // trim the new created array!
            buttons = buttons.map(btn => {
                return btn.trim();
            });
        }
    }
    return buttons;
}

/**
 * generates the actual box
 * @param {prompt} prompt 
 * @param {title} title 
 * @param {btnHTML} btnHTML 
 * @param {classes} classes 
 */
function renderBox(prompt, title, btnHTML, classes) {
    // set a white caption when gradient exists!
    let strGradient = classes.split(' ');
    let captionStyle = (strGradient.length == 2) ? `style="color: whitesmoke !important"` : '';
    document.getElementById('msgBoxBG').innerHTML = `
    <div class="msg-dialog">
        <div class ="${classes}">
            <h2 id="msgCaption" ${captionStyle}>${title}</h2>
        </div>
        <p id="msgPrompt">${prompt}</p>
        ${btnHTML}
    </div>`;
}