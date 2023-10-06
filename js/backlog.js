const BACKLOG_INFO = ['The following tasks need to be planned into a sprint.',
    'There are currently no tasks in the backlog.'
]

/**
 * rendered all backlog tasks
 */
function renderBacklog() {
    let table = $('.tableDiv'),
        info = $('#divBacklog .backlog-info');
    $('backlogContent').innerHTML = '';
    if (backlogCount()) {
        table.classList.remove('hidden');
        info.innerHTML = BACKLOG_INFO[0];

        for (let i = arrTasks.length - 1; i >= 0; i--) {
            const task = arrTasks[i];
            if (task.status == 'backlog') {
                // $('backlogContent').innerHTML += /*html*/ `
                $('backlogContent').innerHTML += generateBacklogHTML(task);
            }
        }
    } else {
        table.classList.add('hidden');
        info.innerHTML = BACKLOG_INFO[1];
    }
}

/**
 * renders the tasks for the backlog
 * @param {item} task item from arrTasks
 * @returns the html-code for the given task
 */
function generateBacklogHTML(task) {
    return `<tr ondblclick ="showInputForm(${task.id})" title ="double-click for edit">
                <td class="${task.priority}">
                    <img src="./img/${task.staff.image}" title="${task.staff.name}">
                    <div class="name">
                        <span>${task.staff.name}</span>
                    </div>
                </td>
                <td class=""><h5>${task.category}</h5></td>
                <td class="">${task.description}</td>
                <td class="table-buttons" onclick="pushToBoard(${task.id})" title ="">TO BOARD</td>
            </tr>`;
}

/**
 * helper function for 'renderBacklog'
 * @returns how many tasks in backlog are to be displayed
 */
function backlogCount() {
    let count = 0;
    for (let i = 0; i < arrTasks.length; i++) {
        if (arrTasks[i].status == 'backlog') count++;
    }
    return count;
}