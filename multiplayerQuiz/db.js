let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
});

const RoomSchema = new Schema({
  roomcode: { type: String, unique: true },
  hostId: ObjectId,
  players: [
    {
      userId: ObjectId,
      score: Number,
      questionCount: Number,
    },
  ], 
  started: { type: Boolean, default: false }
});

const UserModel = mongoose.model("users", UserSchema);
const RoomModel = mongoose.model("rooms", RoomSchema)

module.exports = {
  UserModel,
  RoomModel
};
