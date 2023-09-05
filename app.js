//jshint esversion:6
import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
/*import encrypt from "mongoose-encryption";*/
/*import md5 from "md5";*/
import bcrypt from "bcrypt";

const saltRounds = 10;
const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

/*// encrypt password field and store them in .env
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});*/

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        })

        newUser.save()
            .then(() => res.render("secrets"))
            .catch((err) => console.log(err))
    });
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then((foundUser) => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result === true
                    if (result === true) {
                        res.render("secrets");
                    } else {
                        console.log("Wrong password");
                        res.redirect("/login");
                    }
                });
            } else {
                console.log("User don't exist");
                res.redirect("/login");
            }
        })
        .catch((err) => {
            console.log(err);
        })
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})