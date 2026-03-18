const express = require("express");
const jwt = require("jsonwebtoken");
JWT_SECRET = "thisismyjwtuday";
const app = express();
const { UserModel, NotesModel } = require("./db");
const mongoose = require("mongoose");

app.use(express.json());

mongoose.connect("mongodb+srv://udayshinde259_db_user:uday8881@cluster0.kguish1.mongodb.net/Notes")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

app.post("/register", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  try{
    await UserModel.create({
      email: email,
      password: password,
    });

    res.json({
      msg: "Registered Sucessfully"
    })
    
  }catch(e){
    return res.status(400).json({
      msg: "Incorrect Credentials"
    });
  }

  
});

app.post("/signup", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  let foundUser = await UserModel.findOne({
    email: email,
    password: password
  })

  if (foundUser) {
    let token = jwt.sign(
      {
        id: foundUser._id.toString(),
      },
      JWT_SECRET,
    );

    res.json({
      token: token,
    });
  } else {
    return res.json({
      error: "Please regiser first",
    });
  }
});

function auth(req, res, next) {
  let token = req.headers.token;

  try {
    let decodedData = jwt.verify(token, JWT_SECRET);
    req.id = decodedData.id;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

app.post("/notes", auth, async function (req, res) {
  let title = req.body.title;
  let content = req.body.content;
  let id = req.id;

  if (!title || !content) {
    return res.json({
      error: "Title and content are required",
    });
  }

  try{
    await NotesModel.create({
    userId: id,
    title: title,
    content: content,
  })

  res.json({
    msg: "Created the note sucessfully"
  })
  }catch(e){
    res.status(400).send(e);
  }
  
});

app.get("/notes", auth, async function (req, res) {
  let id = req.id;

  try {
    let allNotes = await NotesModel.find({
    userId: id
  })

  res.json(allNotes)
  } catch (error) {
    return res.status(400).json({
      error: "No notes present"
    })
  }
});

app.get("/notes/:id", auth, async function (req, res) {
  let notesId = req.params.id;
  let userId = req.id;
  

  try {
    let note = await NotesModel.find({
    userId: userId,
    _id: new mongoose.Types.ObjectId(notesId)
  })

  if (note) {
    res.json(note);
  } else {
    res.status(404).json({
      error: "Note not found"
    })
  }
  } catch (error) {
    return res.status(400).json({
      error: "No notes present"
    })
  }
});

app.put("/notes/:id", auth, async function (req, res) {
  let userId = req.id;
  let notesId = req.params.id;
  let updatedTitle = req.body.title;
  let updatedContent = req.body.content;
  
  try {
    const updatedNote = await NotesModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notesId),
      userId: userId
    },
    {
      title: updatedTitle,
      content: updatedContent
    },
    {
      new: true
    }
  )

  if(!updatedNote){
    return res.status(404).json({
        error: "Note not found or not yours"
      });
  }

  res.json(updatedNote);

  } catch (error) {
    res.status(400).json({
      error: "Invalid request"
    });
  }
});

app.delete("/notes/:id", auth, async function (req, res) {
  let notesId = req.params.id;
  let userId = req.id;
  

  try {
    const deletedTodo =  await NotesModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(notesId),
      userId: userId
    })

    if(!deletedTodo){
      return res.status(404).json({
        error: "Note not found or not yours"
      });
    }

    res.json({
      deletedTodo, 
      msg : "todo is sucessfully deleted"
    })
  } catch (error) {
    
  }
});

app.listen(3000);
