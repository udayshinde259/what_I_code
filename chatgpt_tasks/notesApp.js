const express = require("express");
const app = express();

let notes = [];
let id = 1;
app.use(express.json());

app.post("/notes", function(req, res){
    let title = req.body.title;
    let content = req.body.content;

    if (!title || !content) {
        return res.json({
            error: "Title and content are required"
        })
    }

    let newNote = {
        id: id,
        title: title,
        content: content,
        createdAt: new Date()
    }
    id++;
    notes.push(newNote);
    res.json({
        msg: "New note created sucessfully"
    })
})

app.get("/notes", function(req, res){
    res.json(notes)
})

app.get("/notes/:id", function (req, res) {
    let id = parseInt(req.params.id);
    let note = null;

    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            note = notes[i];
        }  
    }

    if (note) {
        res.json(note);
    }else{
        res.status(404).json({
            error: "Not Found"
        })
    }
})

app.put("/notes/:id", function (req, res) {
    let id = parseInt(req.params.id);
    let updatedTitle = req.body.title;
    let updatedContent = req.body.content;
    let noteNo = -1;

    if (!updatedTitle || !updatedContent) {
        return res.json({
            error: "Title and content are required"
        })
    }

    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            noteNo = i;
        }  
    }

    if(noteNo == -1){
        res.json({
            error: "Not Found"
        })
    }else{
        notes[noteNo].title = updatedTitle;
        notes[noteNo].content = updatedContent;
        res.json({
            msg: "The note is updated sucessfully"
        })
    }
})


app.delete("/notes/:id", function (req, res) {
    let id = parseInt(req.params.id);
    let noteNo = -1;

    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            noteNo = i;
        }  
    }

    if(noteNo == -1){
        res.json({
            error: "Not Found"
        })
    }else{
        notes.splice(noteNo, 1);
        res.json({
            msg: "The note is deleted sucessfully"
        })
    }
})




app.listen(3000);




