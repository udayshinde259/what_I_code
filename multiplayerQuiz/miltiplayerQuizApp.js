const express = require("express");
const jwt = require("jsonwebtoken");
const {UserModel, RoomModel} = require("../chatgpt_tasks/db")
const app = express();
const JWT_SECRET = "thisismysecretformpqa";

mongoose.connect("mongodb+srv://udayshinde259_db_user:uday8881@cluster0.kguish1.mongodb.net/Notes")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));


app.use(express.json());

let users = [];
let userId = 1;
let rooms = [];
let roomsId = 1;

let questions = [
  {
    question: "Capital of France?",
    options: ["Paris", "London", "Berlin", "Rome"],
    answer: "Paris",
  },
  {
    question: "5 + 7 = ?",
    options: ["10", "11", "12", "13"],
    answer: "12",
  },
];

app.post("/signin", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    res.status(400).json({
      error: "send username and password ",
    });
    return;
  }

  let found = users.find((u) => u.username === username);

  if (found) {
    res.status(409).json({
      error: "username is already taken",
    });
    return;
  }

  let user = {
    id: userId,
    username,
    password,
  };
  userId++;

  users.push(user);
  res.json({
    msg: "You are sucessfully registered",
  });
});

app.post("/signup", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    res.status(400).json({
      error: "send username and password ",
    });
    return;
  }

  let foundUser = users.find(
    (u) => u.username == username && u.password == password,
  );

  if (foundUser) {
    let id = foundUser.id;
    let token = jwt.sign(
      {
        id,
      },
      JWT_SECRET,
    );

    res.json({
      token: token,
    });
  } else {
    res.status(404).json({
      error: "Incorrect credentials",
    });
  }
});

function authentication(req, res, next) {
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

app.post("/room", authentication, function (req, res) {
  let id = req.id;

  let newRoom = {
    roomId: roomsId,
    hostId: id,
    players: [id],
    scores: { [id]: 0 },
    questionCount: { [id]: 0 },
    started: false,
  };

  roomsId++;
  rooms.push(newRoom);

  res.json({
    roomsId: newRoom.roomId,
  });
});

app.post("/rooms/:roomId/join", authentication, function (req, res) {
  let id = req.id;
  let roomId = req.params.roomId;
  let room = rooms.find((u) => u.roomId == roomId);

  if (!room) {
    return res.status(409).json({
      error: "You have already joined the contest",
    });
  }

  let userPresent = room.players.find((u) => u == id);

  if (room.started) {
    res.status(400).json({
      error: "the room is already started",
    });
    return;
  }

  if (!userPresent) {
    if (room) {
      room.players.push(id);
      room.questionCount[id] = 0;
      room.scores[id] = 0;
      res.json("You have joined the quiz sucessfully");
    } else {
      res.status(404).json({
        error: "Please enter a valid room Id",
      });
    }
  }
});

app.post("/rooms/:roomId/start", authentication, function (req, res) {
  let id = req.id;
  let roomId = req.params.roomId;
  let room = rooms.find((u) => u.roomId == roomId);

  if (room) {
    if (room.hostId == id) {
      room.started = true;

      return res.json({
        msg: "Quiz started successfully",
      });
    } else {
      res.status(404).json({
        error: "Only hosts can start the quiz",
      });
    }
  } else {
    res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
});

app.get("/rooms/:roomId/question", authentication, function (req, res) {
  let id = req.id;
  let roomId = req.params.roomId;
  let room = rooms.find((u) => u.roomId == roomId);

  

  if (!room) {
    return res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }

  if (!room.started) {
    return res.status(400).json({
      error: "Quiz has not started yet",
    });
  }


  let count = room.questionCount[id];
  let userIsPlayer = room.players.find((u) => u === id);

  if (count < questions.length) {
    if (room) {
      if (userIsPlayer) {
        let question = questions[count];
        res.json({
          question: question.question,
          options: question.options,
        });
      } else {
        res.status(404).json({
          error: "Only players who joined group are allowed to ask question",
        });
      }
    } else {
      res.status(404).json({
        error: "Please enter a valid room Id",
      });
    }
  } else {
    res.json({
      msg: "The quiz has ended",
    });
  }
});

app.post("/rooms/:roomId/answer", authentication, function (req, res) {
  let id = req.id;
  let roomId = req.params.roomId;
  let room = rooms.find((u) => u.roomId == roomId);

  if (!room) {
    return res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }

  let count = room.questionCount[id];
  let userIsPlayer = room.players.find((u) => u === id);
  let ans = req.body.answer;

  if (!ans) {
    return res.send(400).json({
      error: "Please send the answer",
    });
    
  }

  if (room) {
    if (userIsPlayer) {
      let correctAnswer = questions[count].answer;
      room.questionCount[id] += 1;
      if (ans === correctAnswer) {
        room.scores[id] += 10;
      }
      if (room.questionCount[id] == questions.length) {
        res.json({
          msg: "Congrats the quiz has ended",
        });
      }

      return res.json({
        msg: ans === correctAnswer ? "Correct answer" : "Wrong answer",
      });
    } else {
      res.status(404).json({
        error: "Only players who joined group can answer",
      });
    }
  } else {
    res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
});

app.get("/rooms/:roomId/leaderboard", authentication, function (req, res) {
  let id = req.id;
  let roomId = req.params.roomId;
  let room = rooms.find((u) => u.roomId == roomId);

  if (!room) {
    return res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
  let userIsPlayer = room.players.find((u) => u === id);

  if (room) {
    if (userIsPlayer) {
      res.send(room.scores);
    } else {
      res.status(404).json({
        error: "Only players who joined this room can view leaderboard",
      });
    }
  } else {
    res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
});

app.listen(3001);
