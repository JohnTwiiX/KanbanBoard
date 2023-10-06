const HTML_TRASH_COLUMN = `
    <div id="divTrash" class="trash columns hidden">
        <h3>DELETED</h3>
        <img class="imgCloseX-small" src="./img/close-48.png" onclick="toggleTrash(false)" title="hide trash">
        <div class="deleted flx-ctr" ondrop="drop(event)" ondragover="allowDrop(event)" data-candrop="true"></div>
    </div>`;

/**
 * short print-function
 * @param {index} index 
 */
function printTask(index) {
    let printWindow = window.open('', '', 'height=720,width=1000');
    printWindow.document.write('<html><head><title>Task drucken</title>');
    printWindow.document.write(`<style> .print-window {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;}
                                </style>`);
    printWindow.document.write('</head><body class="print-window">');
    printWindow.document.write($('task-' + index).innerHTML);
    // remove the icons before print preview!
    printWindow.document.getElementsByClassName('task-icons')[1].remove();
    printWindow.document.getElementsByClassName('task-icons')[0].remove();
    let foto = printWindow.document.getElementsByClassName('portrait')[0];
    foto.style.height = '200px';
    foto.style.width = '150px';
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

/**
 * show the colorpicker
 */
function showColorPicker() {
    let colorPicker = $('inpColorPicker'),
        priority = $('selPriority').value,
        cssColor = getComputedStyle(document.querySelector(':root')).getPropertyValue(`--${priority}`);
    if (priority == '') {
        colorPicker.classList.add('hidden');
        return;
    }
    colorPicker.classList.remove('hidden');
    colorPicker.value = cssColor;
}

function loadSettings () {
    objSettings = JSON.parse(backend.getItem('settings')) || objSettings;
}

function saveSettings () {
    let newColor =  $('inpColorPicker').value,
    priority = $('selPriority').value;
    // Set the value of the css variable -- ??? to another value  
    $(':root').style.setProperty(`--${priority}`, newColor);
    backend.setItem('settings',JSON.stringify(objSettings));
    showSettings(false);
}

/**
 * displays or hides the settings
 * @param {boolean} visible determines if the content is to be displayed or not (true | false)
 */
function showSettings(visible) {
    if (visible) {
        resetFormSettings();
        getActiveMenuItem();
        closeSections();
        $('inpColorPicker').classList.add('hidden');
        $('divSettings').classList.remove('hidden');
    } else {
        $('divSettings').classList.add('hidden');
        activateMenuItem(lastMenu);
    }
    setHeaderIcons();  
}

function resetFormSettings () {
    initSelectionFields('selPriority');
    initSelectionFields('lstCategory');
    initSelectionFields('lstColumns');
    initSelectionFields('lstStaff');
    $('btnCategory').classList.add('hidden');
    $('btnColumns').classList.add('hidden');
    $('btnStaff').classList.add('hidden');
    $('imgUser').src = './img/profile-dummy.png';
}

/**
 * 
 * @param {input} control provides the list to be changed
 */
function changeList(control) {
    const PLUS = '&#x2795',
          MINUS = '&#x2796';
    let listID = control.list.id,
        listName = listID.substring(3),
        isUserName = listName.includes('Staff'),
        arrDest = listName.includes('Category') ? objSettings.category : isUserName ? objSettings.staff.names : objSettings.columns,
        value = control.value,
        button = $('btn' + listName);

    if (isUserName) {
        let ind = getStaffIndex(value),
            foundUser = !(ind === undefined || ind >  objSettings.staff.images.length - 1),
            image = foundUser ? './img/' + objSettings.staff.images[ind] : './img/profile-dummy.png';
        $('imgUser').src = image;
        $('divUsers').dataset.tooltip = foundUser ? objSettings.staff.names[ind] : 'click to upload foto';
    }
    
    button.classList.add('hidden');
    if (value.length < 4) {
        return false;
    } else if (arrDest.includes(value)) {
        button.innerHTML = MINUS;
    } else {
        button.innerHTML = PLUS;
    }
    button.classList.remove('hidden');
    button.title = button.innerHTML == '\u2795' ? `add ${value} to ${listName}` : `remove ${value} from ${listName}`;
}

/**
 * 
 * @param {input} control contains the value to be updated
 * @param {button} button (plus or minus) is the pressed button that executed the function 
 */
function updateList (control, button) {
    let value = $(control).value,
        listName = 'lst' + control.substring(3),
        isUserName = listName.includes('Staff'),
        arrDest = listName.includes('Category') ? objSettings.category : isUserName ? objSettings.staff.names : objSettings.columns;
    // if the new value ain't in the list and the button shows plus, we add it
    if (!arrDest.includes(value) && button.innerHTML ==  '\u2795') {
        arrDest.push(value);
        if (isUserName) {
            let filename = $('imgUser').src;
            // do NOT change a 'base64' file!
            filename = filename.includes('base64') ? filename : filename.getFileName();
            objSettings.staff.images.push(filename);
        }
    // if the button shows a minus, we delete the item from list
    } else if (arrDest.includes(value) && button.innerHTML ==  '\u2796') {
        let index = arrDest.indexOf(value);
        arrDest.splice(index,1);  
        if (isUserName) objSettings.staff.images.splice(index,1);   
    }
    $(control).value = '';
    initSelectionFields(listName);
    $(button.id).classList.add('hidden');
}

/**
 * 
 * @param {event} event file-event
 */
async function uploadFile(event) {
    let userImage = $('imgUser'),
        image = await getFile(event);
    userImage.src = image;
    // old version: do not remove!
    // userImage.src = URL.createObjectURL(event.target.files[0]);
    // userImage.onload = function() {
    //     URL.revokeObjectURL(userImage.src); // free memory
    // }
}

async function getFile(event) {
    const file = event.target.files[0];

    try {
        const result = await getBase64(file);       
        return result
    } catch(error) {
        console.error(error);
        return;
    }
 }

 /**
  * helper function for 'getFile'
  * @param {input} file input file that needs to be converted into base64 format
  * @returns base64 string
  */
 function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        // reader.onload = () => resolve(reader.result.replace('data:', '').replace(/^.+,/, '')); // removes the Data URL part
        reader.onerror = error => reject(error);
    });
}