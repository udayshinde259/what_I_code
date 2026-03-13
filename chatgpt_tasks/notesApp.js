const express = require("express");
const jwt = require("jsonwebtoken");
JWT_SECRET = "thisismyjwtuday";
const app = express();

let notes = [];
let users = [];
let id = 1;
app.use(express.json());

app.post("/regiter", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let found = users.find((u) => u.username === username);

  if (found) {
    res.json({
      error: "username is already taken",
    });
    return;
  }

  let user = {
    username: username,
    password: password,
  };

  users.push(user);
  res.json({ msg: "User registered sucessfully" });
});

app.post("/signup", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let foundUser = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (foundUser) {
    let token = jwt.sign(
      {
        username,
      },
      JWT_SECRET,
    );

    res.json({
      token: token,
    });
  } else {
    res.json({
      error: "Please regiser first",
    });
  }
});

function auth(req, res, next) {
  let token = req.headers.token;


  try {
    let decodedData = jwt.verify(token, JWT_SECRET);
    req.username = decodedData.username;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

app.post("/notes", auth, function (req, res) {
  let title = req.body.title;
  let content = req.body.content;
  let username = req.username;

  if (!title || !content) {
    return res.json({
      error: "Title and content are required",
    });
  }

  let newNote = {
    id: id,
    username: username,
    title: title,
    content: content,
    createdAt: new Date(),
  };
  id++;
  notes.push(newNote);
  res.json({
    msg: "New note created sucessfully",
  });
});

app.get("/notes", auth, function (req, res) {
  let username = req.username;

  let userNotes = notes.filter((u) => u.username == username);
  if (userNotes) {
    res.json(userNotes);
  } else {
    res.json({
      msg: "No notes present",
    });
  }
});

app.get("/notes/:id", auth, function (req, res) {
  let id = parseInt(req.params.id);
  let username = req.username;
  let note = notes.find((u) => u.id == id && u.username == username);

  if (note) {
    res.json(note);
  } else {
    res.status(404).json({
      error: "Not Found",
    });
  }
});

app.put("/notes/:id", auth, function (req, res) {
  let username = req.username;
  let id = parseInt(req.params.id);
  let updatedTitle = req.body.title;
  let updatedContent = req.body.content;
  let noteNo = -1;

  if (!updatedTitle || !updatedContent) {
    return res.json({
      error: "Title and content are required",
    });
  }

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === id && notes[i].username === username) {
      noteNo = i;
    }
  }

  if (noteNo == -1) {
    res.json({
      error: "Not Found",
    });
  } else {
    notes[noteNo].title = updatedTitle;
    notes[noteNo].content = updatedContent;
    res.json({
      msg: "The note is updated sucessfully",
    });
  }
});

app.delete("/notes/:id", auth, function (req, res) {
  let id = parseInt(req.params.id);
  let username = req.username;
  let noteNo = -1;

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === id && notes[i].username === username) {
      noteNo = i;
    }
  }

  if (noteNo == -1) {
    res.json({
      error: "Not Found",
    });
  } else {
    notes.splice(noteNo, 1);
    res.json({
      msg: "The note is deleted sucessfully",
    });
  }
});

app.listen(3000);
