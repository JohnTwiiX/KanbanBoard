

// ##########################################################################
//                          D E C L A R A T I O N S
// ##########################################################################
let editMode = false, // flag for edit-mode
    boardIsVisible, // flag for board to be displayed or not
    trashState = 0, // triple-flag for trash bin to  hide [0] | display [1] | show column [2]
    currID = '', // current id in edit mode (to apply changes)
    lastMenu = 0, // saving the last menu we have been
    // arrTasks = [], // array, holding the tasks
    MENUITEMS, // collection of all menu items - to be loaded after header is loaded from fnc 'includeHTML' !!
    objSettings = {
        category: ["App-Development", "Web-Development", "Bug-Web", "Bug-App", "Marketing", "Product", "Sale", "Management"],
        priority: ["low", "medium", "important", "high"],
        staff: {
            names: ["John", "Sandra", "Sebastian Zimmermann", "Olaf Müller", "Max Mustermann"],
            images: ["john.jpg", "logo_Sandra.png", "sebastian.jpg", "olaf.jpg", "max.jpg"]
        },
        columns: ["to do", "scheduled", "in progress", "done"]
    };
window.arrTasks = [];

// global constant for easier access
const DELETED = 'deleted';
let isTrashOpen = false;

async function init() {
    await includeHTML();
    // await downloadFromServer();
    // loadSettings();
    MENUITEMS = $('.menu-items li'); // must be initialized in this function, not before!!!
    renderBoardColumns();
    renderTasks();
    activateMenuItem(0);
}

/**
 * Pushes all relevant arrays to the server after changes where made on the board (at the moment create & edit tasks)
 */
// function serverUpdate() {
//     backend.setItem('arrTasks', JSON.stringify(arrTasks));
// }

// function taskDownload() {
//     arrTasks = JSON.parse(backend.getItem('arrTasks')) || [];
// }

// 
/**
 * 
 * @param {Id of Task} id deletes a task completely from array and server
 */
async function killTask(id) {
    // playSound('notify.mp3');
    if (await msgBox(`Are you sure, you want to remove this task completely? <br>
        This operation cannot be reversed!`, 'Please confirm!', 'Yes,No', true, true) == 'Yes') {
        const findID = obj => obj.id === id; // define a search expression (on which index in the array is the id?)
        let taskInd = arrTasks.findIndex(findID);
        if (taskInd >= 0) {
            renderTasks();
            deleteTaskFB(id);
            // serverUpdate();
            // saveTasksFB();
        } else {
            playSound('wrong.mp3');
            msgBox(`Task with id# ${id} not found!`, 'Error!', 'OK', true, true);
        }
    }
}

/**
 * ANCHOR addTask
 * adds a new task or applies changes to an existing task,
 * if flag 'editMode' is set to 'true'
 */
async function addTask() {
    let name = $('imgClerk').alt,
        foto = objSettings.staff.images[getStaffIndex(name)],
        deadline = $('inpDeadline').value.isDate();
    if (editMode) {
        editTask(name, foto);
        editMode = false;
        activateMenuItem(lastMenu);
    } else {
        deadline = deadline ? deadline : today();
        foto = foto ? foto : objSettings.staff.images[0];
        name = name ? name : objSettings.staff.names[0];
        const taskId = await createTask(generatedTask(name, foto, deadline))
        const task = {
            id: await taskId,
            value: generatedTask(name, foto, deadline)
        }
        activateMenuItem(1); // display the board after adding new task!
    }
    // serverUpdate();
    // saveTasksFB();
    renderTasks();
}

/**
 * changed the new value in the array
 * @param {arrTasks} name 
 * @param {arrTasks} foto 
 */
function editTask(name, foto) {
    let task = arrTasks.find(task => task.id === currID);

    task.value.title = $('inpTaskTitle').value;
    task.value.description = $('txtDescription').value;
    task.value.category = $('optCategory').value;
    task.value.deadline = format$($('inpDeadline').value);
    task.value.priority = $('optPriority').value;
    task.value.staff.name = name;
    task.value.staff.image = foto;

    updateTask(task);
}

/**
 * changed the value in the array
 * @param {arrTasks} name 
 * @param {arrTasks} foto 
 * @param {arrTasks} deadlineDate 
 * @returns 
 */
function generatedTask(name, foto, deadlineDate) {
    return {
        title: $('inpTaskTitle').value,
        description: $('txtDescription').value,
        category: $('optCategory').value,
        deadline: format$(deadlineDate),
        priority: $('optPriority').value,
        staff: {
            name: name,
            image: foto
        },
        status: 'backlog'
        // status: 'todo'
    }
}

/**
 * pushes the task from backlog to the board into the 'todo'-section
 * @param {arrTasks} id 
 */
function pushToBoard(id) {
    let task = arrTasks.find(task => task.id === id);
    if (task.value.status == 'backlog') {
        task.value.status = 'todo';
        // serverUpdate();
        // saveTasksFB();
        updateTask(task)
        renderBacklog();
    }
}

// updates all ID's after deleting a task
// function updateTaskIDs() {
//     for (let i = 0; i < arrTasks.length; i++) {
//         arrTasks[i].id = i;
//     }
// }

// renders all existing tasks into the correct sections (todo, scheduled etc.)
function renderTasks() {
    let boardSections = Array.from($('#divMainBoard .columns >div')); // first clear all Sections!
    for (let i = 0; i < boardSections.length; i++) { boardSections[i].innerHTML = ''; }
    // updateTaskIDs();
    // now render all tasks into the correct section with a double loop
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            if (container.classList.contains(task.value.status)) {
                container.innerHTML += generateTaskHTML(task);
                setTaskIconState(task);
            }
        }
    }
}

/**
 * deteremines if we show a printer or bin in the task headline, depending on state
 * @param {task} task 
 */
function setTaskIconState(task) {
    const icons = $('#task-' + task.id + ' .task-icons');

    if (task.value.status == DELETED) {
        icons[0].classList.add('hidden');
        icons[1].classList.remove('hidden');
    } else if (task.value.status === 'done') {
        icons[0].classList.remove('hidden');
        icons[1].classList.add('hidden');
    } else {
        icons[0].classList.add('hidden');
        icons[1].classList.add('hidden');
    }
}

/**
 * filtered the tasks
 */
function filterTasks() {
    let search = $('search').value;
    search = search.toLowerCase();
    let boardSections = Array.from($('#divMainBoard .columns >div'));
    for (let i = 0; i < boardSections.length; i++) { boardSections[i].innerHTML = ''; }
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            generateFilterTask(task, container, search);
        }
    }
}

/**
 * filtered task with 5 params
 * @param {task} task 
 * @param {container} container 
 * @param {search} search 
 */
function generateFilterTask(task, container, search) {
    let stateMatch = container.classList.contains(task.status);
    if (task.title.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.description.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.deadline.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.staff.name.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.priority.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.category.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    }
}

/**
 * generated all task with all requirement
 * @param {task} task 
 * @returns 
 */
function generateTaskHTML(task) {
    // <img class="task-icons hidden" src="../assets/img/printer48.png" onclick="printTask(${task.id})" title="print task">
    return /*html*/ `
    <div id="task-${task.id}" class="task grab ${task.value.priority}" draggable="true" ondragstart="drag(event)" 
        ondblclick ="showInputForm('${task.id}')" title="double-click for edit!">
        <img class="task-icons hidden"  src="./img/trash48.png" onclick="deleteTask(this,'${task.id}')" title ="remove task">
        <img class="task-icons" src="./img/trash48.png" onclick="killTask('${task.id}')" title ="delete task">
        <div>
            <h3>${task.value.title}</h3>
            <p class="description">${task.value.description}</p>
        </div>
        <div class="taskEnd">
            <p>${task.value.deadline}</p> 
            <img class="portrait" src ="./img/${task.value.staff.image}" title="${task.value.staff.name}">
            
        </div>
        <div class="category-div">${task.value.category}</div>
    </div>`;
}

/**
 * selects the given menu-item
 * @param {index} index 
 * @returns 
 */
function activateMenuItem(index) {
    if (editMode) return; // in edit mode we exit immediately
    lastMenu = getActiveMenuItem();
    // first remove all other selections and save the last menu-index!
    for (let i = 0; i < MENUITEMS.length; i++) {
        MENUITEMS[i].classList.remove('active');
    }

    closeSections();
    switch (index) {
        case 0:
            showBoard(true);
            break;
        case 1:
            showBackLog(true);
            break;
        case 2:
            showInputForm();
            break;
        case 3:
            showHelp(true);
            break;
        default:
            return; // if no index is provided, we only unselect the links and exit
    }
    MENUITEMS[index].classList.add('active');
    setHeaderIcons(); // hide icons except from settings, when board is invisible!
}

/**
 * saves the active menu item in the global variable 'lastMenu'
 * in order to return to the previous menu when cancelled (used in add task and settings)
 */
function getActiveMenuItem() {
    for (let i = 0; i < MENUITEMS.length; i++) {
        if (MENUITEMS[i].classList.contains('active')) return i;
    }
}

/**
 * enables or disables the icon 'trash' and the searchbar in header
 * @param {status} status
 */
function setHeaderIcons(status) {
    let activeMenu = getActiveMenuItem();
    $('imgBin').classList.toggle('hidden', !boardIsVisible);
    $('.searchbar').classList.toggle('hidden', (activeMenu > 1));
    let arrNodes = $('#divMainBoard .columns.hidden'),
        columnsHidden;
    if (NodeList.prototype.isPrototypeOf(arrNodes)) {
        columnsHidden = arrNodes.length;
    } else {
        columnsHidden = arrNodes.classList.contains('trash') ? 0 : 1;
    }
    $('imgColumnAdd').classList.toggle('hidden', !(activeMenu == 0 && columnsHidden > 0));
}

/**
 * helper-function for fnc 'activateMenuItem': closes all open forms & div's
 */
function closeSections() {
    $('divMainBoard').classList.add('hidden');
    $('divInput').classList.add('hidden');
    showBackLog(false);
    showHelp(false);
    toggleTrash(false);
    $('divSettings').classList.add('hidden');
    boardIsVisible = false; // reset flag!
}

/**
 * resets the input-form and the flag for edit-mode
 */
function resetForm() {
    let form = $('frmInput'),
        image = $('imgClerk');

    image.src = './img/john.jpg';
    image.alt = '';
    $('divClerks').dataset.tooltip = 'John';
    form.reset();
    initSelectionFields('optCategory');
    initSelectionFields('optPriority');
    editMode = false;
}

/**
 * initializes the form's <SELECTION>-Elements
 * @param {selction} selection 
 */
function initSelectionFields(selection) {
    let key = selection.substr(3).toLowerCase(),
        select = $(selection),
        srcArray = (key != 'staff') ? objSettings[key] : objSettings[key].names;

    select.innerHTML = '<option value="">- please select -</option>';
    for (let i = 0; i < srcArray.length; i++) {
        const cat = srcArray[i];
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
}

/**
 * display the board with all states
 * @param {visible} visible 
 */
function showBoard(visible) {
    let board = $('divMainBoard');
    if (visible) {
        board.classList.remove('hidden');
        renderTasks();
    } else {
        board.classList.add('hidden');
    }
    boardIsVisible = visible;
}

/**
 * display the backlog with all states
 * @param {visible} visible 
 */
function showBackLog(visible) {
    renderBacklog();
    let backlog = $('divBacklog');
    if (visible) {
        backlog.classList.remove('hidden');
    } else {
        backlog.classList.add('hidden');
    }
    // serverUpdate();
    // saveTasksFB();
}

/**
 * display the helpsection with all states
 * @param {visible} visible 
 */
function showHelp(visible) {
    let help = $('divHelp');
    if (visible) {
        help.classList.remove('hidden');
    } else {
        help.classList.add('hidden');
    }
}

/**
 * ANCHOR display OR close the input-form:
 * if id is omitted         --> add a NEW task
 * if id = 'false'          --> close the form!
 * if id contains a task    --> edit the provided task
 * @param {id} id 
 * @returns 
 */
function showInputForm(id) {
    // make sure that no nonsense happens when we are in edit mode!
    if (editMode && id !== false) return;
    let form = $('divInput');
    resetForm();
    // form is supposed to be closed! 
    if (id === false) {
        form.classList.add('hidden');
        form.classList.remove('edit-mode');
        activateMenuItem(lastMenu);
        return;
    }
    // if we got a task as paramter, get in edit mode and load datas
    // if id is 'undefined' we are supposed to create a new task!
    if (id != undefined) {
        editMode = true;
        lastMenu = getActiveMenuItem();
        setHeaderIcons(editMode);
        currID = id; // save the id for apply changes!
        form.classList.add('edit-mode');
        loadTaskData(id);
    }
    form.classList.remove('hidden');
    $('.imgBacklog').classList.toggle('hidden', !editMode || lastMenu == 1);
    toggleTrash(false);
    $('frmTitle').innerHTML = editMode ? 'Edit task' : 'Add task';
    $('btnSubmit').innerHTML = editMode ? 'APPLY CHANGES' : 'CREATE TASK';
}

/**
 * loads all datas from the given task(id) into the form for edit mode ANCHOR loadTaskData 
 * @param {id} id 
 */
function loadTaskData(id) {
    let task = arrTasks.find(task => task.id === id);
    $('inpTaskTitle').value = task.value.title;
    $('optCategory').value = task.value.category;
    $('txtDescription').value = task.value.description;
    $('inpDeadline').value = format$(task.value.deadline, 'yyyy-mm-dd');
    $('optPriority').value = task.value.priority;
    let frmImage = $('imgClerk');
    frmImage.src = './img/' + task.value.staff.image;
    frmImage.alt = task.value.staff.name;
    $('divClerks').dataset.tooltip = frmImage.alt; // this adds the css-based tooltip!
}

/**
 * move the tasks to the backlog
 */
function moveTaskToBacklog() {
    let task = arrTasks.find(task => task.id === currID);
    task.value.status = 'backlog';
    updateTask(task);
    showInputForm(false);
}

/**
 * changes the picture and the name of the staff in the input-form
 */
function changeStaff() {
    let image = $('imgClerk'),
        firstname = image.alt.split(' ')[0].toLowerCase(), // images contain only firstname: 'sebastian.jpg'
        index = getStaffIndex(firstname); // search index of the staff-image in settings
    if (index == undefined) index = -1;
    index++;
    if (index >= objSettings.staff.images.length) index = 0; // make sure we stay in correct range of the array!
    image.src = './img/' + objSettings.staff.images[index];
    image.alt = objSettings.staff.names[index];
    $('divClerks').dataset.tooltip = image.alt; // this adds the css-based tooltip!
}

/**
 * returns the index of a staff member according to the given name
 * @param {name} name 
 * @returns 
 */
function getStaffIndex(name) {
    // we can eiter search in names OR pictures (contains a dot => .jpg)!!!
    let arrSearch = name.includes('.') ? objSettings.staff.images : objSettings.staff.names;
    let index = arrSearch.findIndex(i => {
        if (i.toLowerCase().includes(name.toLowerCase()) && name != '') return true;
    });
    if (index == -1) index = undefined;
    return index;
}

/**
 * returns the id as number, provided by the HTML-id
 * @param {string} task format: "task-xx"
 * @returns {integer} number
 */
function getIDNumber(task) {
    let tmp = (task.id).split('-');
    return tmp[1];
}

/**
 * toggled the trash icon 
 * @param {boolean | integer} state false or 0 = hide trash bin, integer: 1 = display icon | 2 = show column
 */
function toggleTrash(state) {
    let trashBin = $('divTrashBin'),
        delColumn = $('divTrash');

    if (isTrashOpen) {
        state = 0;
        isTrashOpen = false;
    } else if (state === false) {
        isTrashOpen = false
    }


    switch (state) {
        case 1:
            // trashBin.classList.remove('hidden');
            delColumn.classList.add('hidden');
            break;
        case 2:
            // trashBin.classList.add('hidden');
            delColumn.classList.remove('hidden');
            isTrashOpen = true;
            break;
        default: // 0 or false!!!
            // trashBin.classList.add('hidden');
            delColumn.classList.add('hidden');
            break;
    }
}

/**
 * PURPOSE 	: several drag- and drop functions
 * 
 * PARAMETERS 	: event	    = the fired event
 * @param {when what happend} event 
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * grabbing a task
 * @param {grabbing} event 
 */
function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

/**
 * dropped a task
 * @param {drop} event 
 * @returns 
 */
function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData('text'),
        task = $(data),
        id = getIDNumber(task),
        status = event.target.classList[0],
        dropAllowed = event.target.dataset.candrop;

    // we leave if dropping is forbidden, in order to avoid dropping tasks in each other
    if (!dropAllowed) {
        // playSound('wrong.mp3');
        return;
    }
    let taskObj = arrTasks.find(task => task.id === id);
    taskObj.value.status = status;
    setTaskIconState(taskObj);
    // deleting per drag'n drop is an exception:
    // we can drag from another column or drop into the bin!
    if (status == DELETED) {
        $('#divTrash .deleted').appendChild(task);
    } else {
        event.target.appendChild(task);
    }
    updateTask(taskObj);
    // saveTasksFB();
    // serverUpdate();
}

function deleteTask(taskElement, id) {
    const taskContainer = taskElement.parentElement;
    let task = arrTasks.find(task => task.id === id);
    task.value.status = DELETED
    $('#divTrash .deleted').appendChild(taskContainer);
    updateTask(task)
    // saveTasksFB();
}

/**
 * rendered all columns
 */
function renderBoardColumns() {
    let board = $('divMainBoard');
    board.innerHTML = '';
    for (let i = 0; i < objSettings.columns.length; i++) {
        const title = objSettings.columns[i].toUpperCase(),
            state = title.toLowerCase().replaceAll(' ', '');
        board.innerHTML += `
            <div class="columns">
                <h3>${title}</h3>
                <img class="imgCloseX-small" src="./img/close-48.png" onclick="hideColumn(${i})" title="hide column">
                <div class="${state} flx-ctr" ondrop="drop(event)" ondragover="allowDrop(event)" data-candrop="true"></div>
            </div>`;
    }
    board.innerHTML += HTML_TRASH_COLUMN;
}

// hides a column from board
async function hideColumn(index) {
    if (await msgBox(`Are you sure, you want to hide this column ? <br>
        `, 'Please confirm!', 'Yes,No', true, true) == 'Yes') {
        let columns = $('.columns');
        columns[index].classList.add('hidden');
        setHeaderIcons();
    }

}

// displays all hidden columns again
function showColumns() {
    let hiddenColumns = Array.from($('.columns.hidden')),
        trash = $('divTrash');
    hiddenColumns.forEach(col => {
        col.classList.remove('hidden');
    });
    trash.classList.toggle('hidden', trashState != 2);
    setHeaderIcons();
}