const addBtn = document.getElementById("addnote");
const noteContainer = document.getElementById("note-container")

// Click event listener for addNote button
addBtn.addEventListener('click', () => { addNewNote() });

// Initialize the page based on localStorage
let savedData = JSON.parse(localStorage.getItem("notes"));

if(savedData && savedData.length !== 0){
    savedData.forEach((noteContent) => { addNewNote(noteContent, false) });
} else {
    let defaultText = `# Markups!\n## Format your notes\n###  With markup syntax in note\n.\n\nI am a line of **text**.\n\n- Markups can be applied.\n- You can format notes with **markups**.\n\[Guide]\n\n[Guide]: https://marked.js.org/`
    addNewNote({ context: defaultText, barColor: "#47AFFF" }, false)
    let defaultTextTwo = `Use the button on the top right corner to add notes.\n\n.\n\nYour notes are automatically saved in your browser, so you can always come back to see your notes back`
    addNewNote({ context: defaultTextTwo, barColor: "#47AFFF" }, false)
}


function addNewNote(config = {}, editMode = true){
    // Creating the note element
    let note = document.createElement("div");
    note.classList.add('note');
    note.draggable = true;
    note.innerHTML = `
    <div class="note-bar" style="background-color: ${config.barColor || "#9AE45E"};">
        <button class="move-left"><i class="fas fa-arrow-left"></i></button>
        <button class="move-right"><i class="fas fa-arrow-right"></i></button>
        <button class="edit"><i class="fas fa-edit"></i></button>
        <button class="palette"><i class="fas fa-palette"></i></button>
        <button class="delete"><i class="fas fa-trash-alt"></i></button>
        <input type="color" class="colorPick" value="#e66465">
    </div>

    <div class="showcase hidden"></div>
    <textarea></textarea>
    `;

    // Extract inner components of the added note
    const deleteBtn = note.querySelector(".delete");
    const editBtn = note.querySelector(".edit");
    const showcase = note.querySelector(".showcase");
    const textArea = note.querySelector("textarea");

    // Write initial text to both textarea and showcase (with marked)
    showcase.innerHTML = marked(config.context || "");  // marked = enable marked.js format
    textArea.value = config.context || "";

    // Edit functionality -- toggle edit mode & initial settings
    let toggleEdit = function() {
        showcase.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
        note.draggable = textArea.classList.contains('hidden');
    };

    editBtn.addEventListener('click', () => { toggleEdit() });
    showcase.addEventListener('dblclick', () => { toggleEdit() });
    textArea.addEventListener('dblclick', () => { toggleEdit() });
    if(!editMode){ toggleEdit() }

    // The delete functionality
    deleteBtn.addEventListener('click', () => {
        note.remove();
        updateLocalStorage();
    });

    // Color note functionality
    const colorInput = note.querySelector(".colorPick")
    colorInput.addEventListener('input', () => {
        const notebar = note.querySelector(".note-bar");
        notebar.style.backgroundColor = colorInput.value;
        updateLocalStorage();
    })

    // Swap notes functionality
    let moveNote = function(current, direction = "left") {
        // determine target to swap
        let toSwap = direction === "left" ? current.previousSibling : current.nextSibling;

        // do nothing if the target is not an actual note
        if(!toSwap || !toSwap.classList){ return }

        // swap by insertBefore()
        if(direction === 'left'){
            noteContainer.insertBefore(current, toSwap);
        } else {
            // treat it as insertAfter, JS does not have that exact function
            noteContainer.insertBefore(current, toSwap.nextSibling)
        }

        updateLocalStorage();
    }

    const leftArrow = note.querySelector('.move-left');
    leftArrow.addEventListener('click', () => { moveNote(note, "left"); })
    
    const rightArrow = note.querySelector('.move-right');
    rightArrow.addEventListener('click', () => { moveNote(note, "right"); })

    // Input functionality -- update showcase text to textarea text
    textArea.addEventListener('input', (e) => {
        updateLocalStorage();

        let { value } = e.target;
        showcase.innerHTML = marked(value);
    })

    // Put note to the DOM
    noteContainer.appendChild(note);
}

function updateLocalStorage() {
    let createdNotes = [...document.querySelectorAll(".note")]
    let notesData = [];
    
    createdNotes.forEach((note) => {
        notesData.push({
            context: note.querySelector('textarea').value,
            barColor: note.querySelector('.note-bar').style.backgroundColor,
        })
    })

    // Upload to localStorage
    localStorage.setItem('notes', JSON.stringify(notesData))
}