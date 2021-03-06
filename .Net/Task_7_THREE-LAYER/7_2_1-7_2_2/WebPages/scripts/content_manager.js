﻿let queue = [];
let filteredNotes;
let firstRun = true;
let lastInput = '';
let hiddenNotes = [];
let removedNotes = [];
let hightLights = true;
let movingMap = new Map();
let hightLightedNotes = [];
let сontentManagerDown = true;
let processingList = new Map();


function SearchInput(input) {

    let step = new Map();
    let allNotes = storage.getAll();
    lastInput = input.toLowerCase();
    filteredNotes = storage.getByData(input);

    for (let key of allNotes.keys()) {

        if (!filteredNotes.has(key)) {

            step.set(key, 'hd'); 
        }
        else {
            if (hiddenNotes.filter(function (a) { return a.id == key }).length > 0) {

                step.set(key, 'rs');
            }
        }
    }
    if (step) {
        ContentManager(step);
    }
}

function ContentManager(step) {

    queue.push(step); 
    if (сontentManagerDown) {

        сontentManagerDown = false;

        let temp = document.getElementsByClassName('body-element');
        let notesOnPage = [];

        for (let note of temp) {

            notesOnPage.push(note);

            if (desktop) {

                if (firstRun) {

                    note.style.opacity = '1';
                }

                note.style.left = `${(note.getBoundingClientRect()['x'])}px`;
                note.style.top = `${note.getBoundingClientRect()['y'] - 10}px`;
            }
        }

        if (firstRun) {
            firstRun = false;
        }

        if (desktop) {

            for (let note of temp) {

                note.style.position = 'fixed';
            }
        }

        while (queue.length > 0) {

            let curStep = queue.shift();

            for (let item of curStep.keys()) {

                if (curStep.get(item) == 'cr') {

                    let tmp = document.getElementsByClassName('body-element');

                    if (tmp.length > 0) {
                        let left = tmp[tmp.length - 1].getBoundingClientRect()['x'];
                        let top = tmp[tmp.length - 1].getBoundingClientRect()['y'];

                        item.style.top = `${top}px`;
                        item.style.left = `${left}px`;
                    }
                    notesOnPage.push(item);

                    if (storage.getByData(lastInput).has(item.id)) {

                        if (desktop) {

                            ChangeOpacity(item, 1);
                        }
                        else {
                            item.style.opacity = '1';
                        }

                        mainPageBody.appendChild(item);

                    }
                    else {
                        hiddenNotes.push(item);
                    }
                }
            }

            for (let id of curStep.keys()) {

                if (curStep.get(id) == 'rm' && document.getElementById(id)) {

                    storage.deleteByID(id);
                    let item = document.getElementById(id);
                    notesOnPage.splice(notesOnPage.indexOf(item), 1);

                    if (desktop) {

                        let commonHeight = 0;

                        for (let elem of notesOnPage) { 

                            commonHeight += elem.getBoundingClientRect()['height'] + 10;

                            if (commonHeight >= window.innerHeight - 65) {

                                body.style.overflowY = 'scroll';
                                break;
                            }
                        }

                        removedNotes.push(item);

                        ChangeOpacity(item, 0);
                    }
                    else {
                        mainPageBody.removeChild(item);
                    }
                }
            }

            for (let id of curStep.keys()) {

                if (curStep.get(id) == 'hd' && document.getElementById(id)) {

                    let item = document.getElementById(id);

                    if (desktop) {

                        let commonHeight = 0;

                        for (let elem of notesOnPage) { 

                            commonHeight += elem.getBoundingClientRect()['height'] + 10;

                            if (commonHeight >= window.innerHeight - 65) {

                                body.style.overflowY = 'scroll';
                                break;
                            }
                        }

                        ChangeOpacity(item, 0);   
                    }
                    else {
                        mainPageBody.removeChild(item);
                    }

                    if (!hiddenNotes.includes(item)) {

                        hiddenNotes.push(item);
                    }

                }
            }

            for (let id of curStep.keys()) {

                if (curStep.get(id) == 'rs') {

                    let note;

                    for (let item of hiddenNotes) {

                        if (item.id == id) {

                            note = item;
                            hiddenNotes.splice(hiddenNotes.indexOf(item), 1);
                            break;
                        }
                    }

                    if (processingList.has(note)) {

                        processingList.set(note, 1);
                    }
                    else {

                        itemPlaced = false;

                        for (let item of notesOnPage) {

                            if (parseInt(item.id) >= parseInt(id)) {

                                mainPageBody.insertBefore(note, item);
                                itemPlaced = true;
                                break;
                            }
                        }
                        if (!itemPlaced) {

                            mainPageBody.appendChild(note);
                        }

                        if (desktop) {

                            ChangeOpacity(note, 1);
                        }
                        else {
                            note.style.opacity = '1';
                        }
                    }
                }
            }

            if (desktop) {

                MoveItems();    

                if (hightLights) {   

                    HightlightSearch();
                }
            }
        }
        сontentManagerDown = true;
    }
}


function MoveItems() {

    let notesOnPage = document.getElementsByClassName('body-element');
    let top = 55;
    let upperOffset = -10;
    let bottomOffset = 55;

    for (let note of notesOnPage) {

        if (!hiddenNotes.includes(note) && !removedNotes.includes(note)) {

            if (top < window.innerHeight || note.getBoundingClientRect()['top'] - 10 < window.innerHeight || movingMap.has(note)) {    

                if (note.getBoundingClientRect()['top'] > window.innerHeight) {

                    note.style.top = `${window.innerHeight + upperOffset}px`;
                    upperOffset += (note.getBoundingClientRect()['height'] + 10);
                }

                if (note.getBoundingClientRect()['top'] < 55 - note.getBoundingClientRect()['height']) {

                    note.style.top = `${bottomOffset - note.getBoundingClientRect()['height']}px`;
                    bottomOffset -= (note.getBoundingClientRect()['height'] + 10);

                }


                MoveItem(note, top);
            }
            else {                              
                note.style.top = `${top}px`;
            }

            top = top + note.getBoundingClientRect()['height'] + 10;
        }
    }
}


function ChangeOpacity(item, targetOpacity, speed = 35, func = null) {

    if (processingList.has(item)) {

        processingList.set(item, targetOpacity);
    }
    else {
        processingList.set(item, targetOpacity);

        let opacity = parseFloat(item.style.opacity);

        if (!opacity) { opacity = 0 };

        let changingProcess = setInterval(function () {   

            if ((processingList.get(item) > 0 && opacity > 1) || (processingList.get(item) <= 0 && opacity < 0)) {

                clearInterval(changingProcess)

                if (opacity.toFixed(0) == 0) {

                    if (func) {
                        func();
                    }
                    else {
                        mainPageBody.removeChild(item);

                        if (removedNotes.includes(item)) {
                            removedNotes.splice(removedNotes.indexOf(item), 1);
                        }
                    }
                }

                processingList.delete(item);

                if (movingMap.size == 0 && processingList.size == 0) {
                    // При обрабоотке прозрачности последнего элемента, при отсутстии перемещаемых элементов, позиционирование всех элементоов выставляется в static

                    for (let item of document.getElementsByClassName('body-element')) {

                        item.style.position = 'static';
                    }

                    if (hiddenNotes.length == 0 && body.style.overflowY == 'scroll') {
                        body.style.overflowY = '';
                    }
                }

                return;
            }

            if (item.style.opacity > processingList.get(item)) {

                opacity -= 0.1;
                item.style.opacity = opacity;
            }
            else {
                opacity += 0.1;
                item.style.opacity = opacity;
            }

        }, speed);
    }
}


function MoveItem(note, target) {
    // СИНХРОННАЯ функция перемещающая конкретную заметку по полю

    if (movingMap.has(note)) {

        movingMap.set(note, target);

    }
    else {

        movingMap.set(note, target);

        let step = 5;   // step и initialStep следует изменять одновременно!
        let initialStep = 5;
        let topOffset = 0;
        let topPosition = note.getBoundingClientRect()['y'] - 10;

        if (Math.abs(note.getBoundingClientRect()['y'] - 10 - movingMap.get(note)) < step && step == initialStep) {    // Утоньшение шага при близости целевой позиции для более точного позиционирования

            step = 1;
        }

        let mooving = setInterval(function () {    // Цикл изменения положения элемента с интервалом между шагами. Цель положения указана в карте movingMap и изменяется асинхронно

            if ((note.getBoundingClientRect()['y'] - 10 > window.innerHeight && topOffset > step) || (note.getBoundingClientRect()['y'] - 10 < 0 && topOffset < 0 - step)) {
                // Оптимизация. Элемент за границами экрана прекращает движение и распологается в целевой точке

                note.style.top = `${movingMap.get(note)}px`;
            }

            if ((note.getBoundingClientRect()['y'] - 10 < movingMap.get(note) + step && note.getBoundingClientRect()['y'] - 10 > movingMap.get(note) - step)) {

                clearInterval(mooving);
                movingMap.delete(note);

                if (movingMap.size == 0 && processingList.size == 0) {
                    // При обрабоотке положения последнего элемента, при отсутстии элементов изменяющих прозрачность, позиционирование всех элементоов выставляется в static

                    for (let item of document.getElementsByClassName('body-element')) {

                        item.style.position = 'static';
                    }

                    if (hiddenNotes.length == 0 && body.style.overflowY == 'scroll') {
                        body.style.overflowY = '';
                    }
                }

                return;
            }

            note.style.top = `${topPosition + topOffset}px`

            if (Math.abs(note.getBoundingClientRect()['y'] - 10 - movingMap.get(note)) < step && step == initialStep) {    // Утоньшение шага при близости целевой позиции для более точного позиционирования

                step = 1;
            }

            if (Math.abs(note.getBoundingClientRect()['y'] - 10 - movingMap.get(note)) > step * 5 && step != initialStep) {    // Утолщение шага при перекладках перед достижением целевой позиции

                step = initialStep;
            }

            if (note.getBoundingClientRect()['y'] - 10 > movingMap.get(note)) {

                topOffset -= step;
            }
            else {
                topOffset += step;
            }

        }, 5);
    }
}


function HightlightSearch(shutingDown = false) {
    // Регистронезависимая функция подсвечивающая искомый текст в заметках-результатах поиска:

    let notesOnPage = document.getElementsByClassName('body-element');

    for (let note of notesOnPage) {

        if (!['', ' '].includes(lastInput) && !shutingDown) {

            if (!hiddenNotes.includes(note) && !removedNotes.includes(note) && filteredNotes.has(note.id)) {

                let raw = storage.getByID(note.id);
                let title = raw[0].toLowerCase();

                let temp = [];
                let count = 0;
                let curIndex = 0;

                // Поиск совпадений в заголовке заметки:

                for (i of title.matchAll(new RegExp(lastInput, 'gi'))) {

                    temp.push(raw[0].substring(curIndex, i.index));
                    curIndex = i.index + lastInput.length;
                    temp.push(`<span class="hightlight">${raw[0].substring(i.index, curIndex)}</span>`);
                    count++;

                }

                if (count) {

                    if (!hightLightedNotes.includes(note)) {
                        hightLightedNotes.push(note);
                    }

                    temp.push(raw[0].substring(curIndex, title.length));
                    let curNote = note.querySelector('.body-element-header');
                    curNote.innerHTML = temp.join('');
                }
                else {
                    if (hightLightedNotes.includes(note)) {

                        let curNoteTitle = note.querySelector('.body-element-header');
                        curNoteTitle.innerHTML = raw[0];

                    }
                }

            }
            else if (!filteredNotes.has(note.id) && hightLightedNotes.includes(note)) {

                let raw = storage.getByID(note.id);
                let curNoteTitle = note.querySelector('.body-element-header');
                curNoteTitle.textContent = `${raw[0]}`;
                hightLightedNotes.splice(hightLightedNotes.indexOf(note), 1);
            }
        }
        else {

            for (let note of hightLightedNotes) {    // Отключение подвестки при пустой строке поиска или при сигнале отключения подсветки

                let raw = storage.getByID(note.id);

                if (raw) {
                    let curNoteTitle = note.querySelector('.body-element-header');
                    curNoteTitle.textContent = `${raw[0]}`;
                }
            }

            hightLightedNotes = [];
        }
    }
}