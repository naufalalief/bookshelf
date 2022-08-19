const bookshelf = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookshelf';

document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('book-form');
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const bookComplete = document.getElementById('inputBookIsComplete').checked;
    const generatedID = generateId();
    console.log(generatedID);
    if (bookComplete) {
        const bookObject = generateBookObject(generatedID, title, author, year, true);
        bookshelf.push(bookObject);
    } else {
        const bookObject = generateBookObject(generatedID, title, author, year, false);
        bookshelf.push(bookObject);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isFinished) {
    return {
        id,
        title,
        author,
        year,
        isFinished
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const unfisnishedBookList = document.getElementById('unfinished-book');
    unfisnishedBookList.innerHTML = '';

    const finishedBookList = document.getElementById('finished-book');
    finishedBookList.innerHTML = '';

    for (const bookItem of bookshelf) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isFinished)
            unfisnishedBookList.append(bookElement);
        else
            finishedBookList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Author: " + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = "Tahun: " + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');
    textContainer.append(textTitle, textAuthor, textYear);

    const textFinished = document.createElement('div');
    textFinished.classList.add('item-shadow');
    textFinished.append(textContainer);
    textFinished.setAttribute('data-id', `book-${bookObject.id}`);


    if (bookObject.isFinished) {
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Belum Selesai';
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', () => {
            undoBook(bookObject.id);
        });
        const trashButton = document.createElement('button');
        trashButton.innerText = 'Hapus Buku';
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', () => {
            if (confirm('Apakah anda yakin ingin menghapus buku ini?')) {
                deleteBook(bookObject.id);
            }
            else {
                return;
            }
        });
        textFinished.append(undoButton, trashButton);
    } else {
        const finishButton = document.createElement('button');
        finishButton.innerText = 'Selesai dibaca';
        finishButton.classList.add('finish-button');

        finishButton.addEventListener('click', () => {
            finishBook(bookObject.id);
        });
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit Buku';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            editBook(bookObject.id);
        });
        textFinished.append(finishButton, editButton);
    }

    return textFinished;
}

function editBook(id) {
    const ts = document.getElementById('edit_book');
    const st = document.getElementById('add_book');
    ts.removeAttribute('hidden');
    st.setAttribute('hidden', true);
    const book = bookshelf.find(book => book.id === id);
    const title = document.getElementById('edtitle');
    const author = document.getElementById('edauthor');
    const year = document.getElementById('edyear');
    const bookComplete = document.getElementById('edinputBookIsComplete');    
    title.value = book.title;
    author.value = book.author;
    year.value = book.year;
    bookComplete.checked = book.isFinished;
    const bookForm = document.getElementById('book-edit');
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateBook(id);
    } );
}

function updateBook(id) {
    const title = document.getElementById('edtitle').value;
    const author = document.getElementById('edauthor').value;
    const year = document.getElementById('edyear').value;
    const bookComplete = document.getElementById('edinputBookIsComplete').checked;
    const bookObject = generateBookObject(id, title, author, year, bookComplete);
    const bookIndex = bookshelf.findIndex(book => book.id === id);
    bookshelf[bookIndex] = bookObject;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function search(title){
    const book = bookshelf.find(book => book.title === title);
    return book;
}

function finishBook(id) {
    const book = findBookID(id);

    if (book == null) {
        return;
    }

    book.isFinished = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}
function findBookID(id) {
    for (const book of bookshelf) {
        if (book.id === id) {
            return book;
        }
    }
    return null;
}

function deleteBook(id) {
    const book = findBookID(id);
    if (book == null) {
        return;
    }
    bookshelf.splice(bookshelf.indexOf(book), 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function undoBook(id) {
    const book = findBookID(id);
    if (book == null) {
        return;
    }
    book.isFinished = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function saveBook() {
    if (isStorageExist()) {
        const pars = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, pars);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document, addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
}
);

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data != null) {
        for (const book of data) {
            bookshelf.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function batal(){
    const x = document.getElementById('add_book');
    const y = document.getElementById('edit_book');

    x.removeAttribute('hidden');
    y.setAttribute('hidden', true);
}