var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const bodyParser = require("body-parser");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var uploadRouter = require("./routes/upload");
var resultRouter = require("./routes/result");
var demoRouter = require("./routes/demo");
var impressumRouter = require("./routes/impressum");
var trainingsgebieteGeoJSONRouter = require("./routes/trainingsgebieteGeoJSON");

var app = express();

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/upload", uploadRouter);
app.use("/result", resultRouter);
app.use("/demo", demoRouter);
app.use("/impressum", impressumRouter);
app.use("/trainingsgebieteGeoJSON", trainingsgebieteGeoJSONRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.use(cors());
app.use(bodyParser.json());

module.exports = app;
