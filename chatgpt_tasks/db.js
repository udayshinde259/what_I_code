let mongoose = require ("mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    email: {type: String, unique: true},
    password: String
});

const NotesSchema = new Schema({
    title: String,
    content: String,
    userId: String
})

const UserModel = mongoose.model("user", UserSchema);
const NotesModel = mongoose.model("notes", NotesSchema);

module.exports = {
    UserModel,
    NotesModel
};