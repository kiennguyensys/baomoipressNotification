var express = require("express");
var router = express.Router();
import schedule from "node-schedule";
import { sendNotif } from "../FCM";

var tasks = [];

router.post("/", function(req, res, next) {
    const { data } = req.body
    const { scheduleAction, scheduleData } = data

    if(scheduleAction === "now"){
        const { title, body, image, slug, tokens, topics } = data
        sendNotif({title, body, image, slug}, tokens, topics)
        res.send("sended!");
    }

    if(scheduleAction === "scheduled") {
        const { dateTime } = scheduleData
        const { title, body, image, slug, tokens, topics } = data

        var newTask = schedule.scheduleJob(dateTime, function(){
            sendNotif({title, body, image, slug}, tokens, topics)
            console.log('fireDate: ' + dateTime.toString());
        });

        tasks.push({ data: data, job: newTask })
        res.send("scheduled task created!");
    }

    if(scheduleAction === "recurring") {
        const { recurringExpression } = scheduleData
        const { title, body, image, slug, tokens, topics } = data

        var newTask = schedule.scheduleJob(recurringExpression, function(){
            sendNotif({title, body, image, slug}, tokens, topics)
            console.log('recurring: ' + recurringExpression.toString());
        });

        tasks.push({ data: data, job: newTask })
        res.send("recurring task created!");
    }

    if(scheduleAction === "checkCurrentTasks") {
        const tasksWithDataOnly = tasks.map(task => task.data)
        res.send(tasksWithDataOnly)
    }

    if(scheduleAction === "deleteTask") {
        const index = scheduleData.deleteTaskIndex
        const item = tasks[index].job
        item.cancel();
        tasks.splice(index, 1)
        res.send("delete task: " + index)
    }

});

module.exports = router;

