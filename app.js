var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var fcmSenderRouter = require("./routes/fcmSender");
var fcmCronRouter = require("./routes/fcmCron");

var app = express();

app.use(cors());
//app.use(logger("dev"));
//app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/fcm-sender", fcmSenderRouter);
app.use("/fcm-cron", fcmCronRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get("env") === "development" ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render("error");
// });

//production handler
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

module.exports = app;
