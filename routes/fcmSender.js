var express = require("express");
var router = express.Router();
var { sendNotif } = require("../FCM.js");

router.post("/", function(req, res, next) {
    res.send("sending OK!");
    const { title, body, slug, image, topics, tokens } = req.body
    sendNotif({title, body, image, slug}, tokens, topics)
});

module.exports = router;
