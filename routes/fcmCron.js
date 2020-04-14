var express = require("express");
var router = express.Router();
import cron from "node-cron";
import { fcmCronLatestPost } from "../FCM";

var task;

router.post("/", function(req, res, next) {
    const { action } = req.body

    if(action === "start"){
        task = cron.schedule("* * * * *", () => {
          console.log(`one minute passed, notification sended`);
          fcmCronLatestPost();
        });
        // task = cron.schedule("0 */4 * * *", () => {
        //   console.log(`four hours passed, notification sended`);
        //   fcmCronLatestPost();
        // });

        res.send("cron start!");
    }

    if(action === "destroy") {
        task.destroy()
        res.send("cron stop!");
    }

    if(action === "checkRunningTask") {
        if(task) {
            res.send(task.status)
        }
        else res.send("null")
    }
});

module.exports = router;

