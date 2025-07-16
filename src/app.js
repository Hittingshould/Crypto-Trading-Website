const Path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express(); //UNPACK EXPRESS

require("./db/mongoose"); //CONNECT TO DB
app.use(cookieParser()); //READ COOKIES FROM CLIENT
const userRouter = require("./router/user");
const traderRouter = require("./router/trader");
const emailRouter = require("./router/email");
const viewRouter = require("./router/view");
const transactionRouter = require("./router/transaction");

app.set("view engine", "pug");
app.set("views", Path.join(__dirname, "views")); //SET PATH FOR VIEWS

app.use(cors());
app.use(express.json()); //PARSE INCOMING JSON DATA TO JS OBJECTS

app.use(express.static(Path.join(__dirname, "public"))); //SET PUBLIC PATH

app.use(viewRouter);
app.use(userRouter);
app.use(traderRouter);
app.use(transactionRouter)
app.use(emailRouter);

module.exports = app;
