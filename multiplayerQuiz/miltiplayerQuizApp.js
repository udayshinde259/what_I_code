const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const zod = require("zod");
const app = express();
const JWT_SECRET = "thisismysecretformmpqa";
const { UserModel, RoomModel } = require("./db");

mongoose
  .connect(
    "mongodb+srv://udayshinde259_db_user:uday8881@cluster0.kguish1.mongodb.net/quiz-app",
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.use(express.json());

let questions = [
  {
    question: "Capital of Japan?",
    options: ["Tokyo", "Beijing", "Seoul", "Bangkok"],
    answer: "Tokyo",
  },
  {
    question: "Largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: "Jupiter",
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Shakespeare", "Dickens", "Hemingway", "Tolstoy"],
    answer: "Shakespeare",
  },
  {
    question: "Which gas do plants absorb?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answer: "Carbon Dioxide",
  },
];

app.post("/signup", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: "send username and password ",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    await UserModel.create({
      email: email,
      password: hashedPassword,
    });

    res.json({
      msg: "You have sucessfully signed up",
    });
  } catch (error) {
    res.status(400).json({
      error: "User already exits or invaild data",
    });
  }
});

app.post("/signin", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: "send username and password ",
    });
    return;
  }

  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    res.status(401).json({
      error: "Incorrect Email",
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      error: "Incorrect password",
    });
    return;
  }

  let token = jwt.sign(
    {
      id: user._id.toString(),
    },
    JWT_SECRET,
  );

  res.json({
    token: token,
  });
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

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.post("/room", authentication, async function (req, res) {
  let id = req.id;

  const roomcode = generateRoomCode();

  await RoomModel.create({
    roomcode: roomcode,
    hostId: id,
    players: [
      {
        userId: id,
        score: 0,
        questionCount: 0,
      },
    ],
  });

  res.json({
    roomcode: roomcode,
  });
});

app.post("/rooms/:roomcode/join", authentication, async function (req, res) {
  let id = req.id;
  let roomcode = req.params.roomcode;
  let result = await RoomModel.updateOne(
    {
      roomcode: roomcode,
      "players.userId": { $ne: id },
    },
    {
      $push: {
        players: {
          userId: id,
          score: 0,
          questionCount: 0,
        },
      },
    },
  );

  if (result.modifiedCount === 0) {
    return res.status(400).json({
      error: "User is already in the room or Room not found",
    });
  }

  res.json({
    msg: "Joined Room Sucessfully",
  });
});

app.post("/rooms/:roomcode/start", authentication, async function (req, res) {
  let id = req.id;
  let roomcode = req.params.roomcode;

  const room = await RoomModel.findOne({ roomcode });

  if (room) {
    if (room.hostId.toString() == id) {
      room.started = true;

      await room.save();

      return res.json({
        msg: "Quiz started successfully",
      });
    } else {
      return res.status(403).json({
        error: "Only hosts can start the quiz",
      });
    }
  } else {
    return res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
});

app.get("/rooms/:roomcode/question", authentication, async function (req, res) {
  let id = req.id;
  let roomcode = req.params.roomcode;
  let room = await RoomModel.findOne({ roomcode });

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

  let player = room.players.find((u) => u.userId.toString() == id);

  if (!player) {
    return res.status(404).json({
      error: "User is not a player",
    });
  }

  let count = player.questionCount;

  if (count < questions.length) {
    let question = questions[count];
    res.json({
      question: question.question,
      options: question.options,
    });
  }
});

app.post("/rooms/:roomcode/answer", authentication, async function (req, res) {
  let id = req.id;
  let roomcode = req.params.roomcode;
  let room = await RoomModel.findOne({ roomcode });

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

  let player = room.players.find((u) => u.userId.toString() == id);

  if (!player) {
    return res.status(404).json({
      error: "User is not a player",
    });
  }

  let count = player.questionCount;
  let ans = req.body.answer;

  if (player.questionCount >= questions.length) {
  return res.status(400).json({
    error: "Quiz already completed",
  });
}

  if (!ans) {
    return res.status(400).json({
      error: "Please send the answer",
    });
  }

  let correctAnswer = questions[count].answer;
  player.questionCount += 1;
  if (ans === correctAnswer) {
    player.score += 10;
  }
  await room.save();
  if (player.questionCount >= questions.length) {
    return res.json({
      msg: "Congrats the quiz has ended",
    });
  }

  if (ans === correctAnswer) {
    return res.json({
      msg: "Correct answer",
    });
  } else {
    return res.json({
      msg: "Wrong answer",
    });
  }
});

app.get("/rooms/:roomcode/leaderboard", authentication, async function (req, res) {
  let id = req.id;
  let roomcode = req.params.roomcode;
  let room = await RoomModel.findOne({roomcode});

  if (!room) {
    return res.status(404).json({
      error: "Please enter a valid room Id",
    });
  }
  let player = room.players.find((u) => u.userId.toString() === id);

    if (player) {
      res.send(room.players);
    } else {
      res.status(404).json({
        error: "Only players who joined this room can view leaderboard",
      });
    }
  
});

app.listen(3001);
