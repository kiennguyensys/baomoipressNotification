var express = require("express");
var router = express.Router();
var { sendNotif } = require("../FCM.js");

router.post("/", function(req, res, next) {
    const { title, body, slug, image, topics, tokens } = req.body
    res.send("sending with title: " + title);
    sendNotif({title, body, image, slug}, tokens, topics)
});

module.exports = router;
