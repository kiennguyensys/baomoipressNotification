var express = require("express");
var router = express.Router();
import schedule from "node-schedule";
import axios from "axios";
import { sendNotif } from "../FCM";

var tasks = [];

router.post("/", function(req, res, next) {
    const { action } = req.body

    if(action === 'createPlan'){
        const { notificationData, scheduleData, recipientData } = req.body
        const scheduleOption = scheduleData.scheduleOption

        if(scheduleOption === "now"){
            handleSendingNotifsToRecipients(notificationData, recipientData)
            res.send("sended!");
        }

        if(scheduleOption === "scheduled") {
            const scheduleDateTime = scheduleData.scheduleDateTime


            var newTask = schedule.scheduleJob(scheduleDateTime, function(){
                handleSendingNotifsToRecipients(notificationData, recipientData)
                console.log('fireDate: ' + scheduleDateTime.toString());
            });

            tasks.push({ data: req.body, job: newTask })
            res.send("scheduled task created!");
        }

        if(scheduleOption === "recurring") {
            const scheduleRecurringExpression = scheduleData.scheduleRecurringExpression

            var newTask = schedule.scheduleJob(scheduleRecurringExpression, function(){
                handleSendingNotifsToRecipients(notificationData, recipientData)
                console.log('recurring: ' + scheduleRecurringExpression.toString());
            });

            tasks.push({ data: req.body, job: newTask })
            res.send("recurring task created!");
        }
    }

    if(action === "getPlans") {
        const tasksWithDataOnly = tasks.map(task => task.data)
        res.send(tasksWithDataOnly)
    }

    if(action === "deletePlan") {
        const index = req.body.deletePlanIndex
        const item = tasks[index].job
        item.cancel();
        tasks.splice(index, 1)
        res.send("delete plan: " + index)
    }
});

const handleSendingNotifsToRecipients = (notificationData, recipientData) => {
    const recipientOption = recipientData.recipientOption

    if(recipientOption === 'singleRecipient')
        sendNotif(notificationData, recipientData.singleFCMToken)

    if(recipientOption === 'allRecipients')
        sendNotif(notificationData, [], 'news')

    if(recipientOption === 'filterRecipients')
        onSendFilterRecipients(notificationData, recipientData)
}

const onSendFilterRecipients = async(notificationData, recipientData) => {
    const apiUrl = "https://app.baomoi.press/wp-json/wp/v2/"
    const filterQuery = recipientData.filterQuery

    const validRecipientsNumber = await axios.get(apiUrl + "users?per_page=1" + filterQuery)
    .then(res => {
        return res.headers["x-wp-total"]
    })
    .catch(err => {
        console.log(err)
        return false
    })

    if(validRecipientsNumber){
        for (var batchNumber = 0; batchNumber <= validRecipientsNumber/1000 ; batchNumber++) {
            let promises = [];

            for (var pageNumber = batchNumber * 10 + 1; pageNumber <= batchNumber * 10 + 10 ; pageNumber++) {
                const url = apiUrl + "users?per_page=100&page=" + pageNumber.toString() + filterQuery
                promises.push(axios.get(url))
            }

            await axios.all(promises).then(results => {
                let fcmTokensBatch = []
                results.forEach(chunk => {
                    if(chunk.data.length) {
                        let fcmTokens = chunk.data.map(item => item.acf.fcmToken)
                        fcmTokensBatch = [...fcmTokensBatch, ...fcmTokens]
                    }
                })

                sendNotif(notificationData, fcmTokensBatch.toString())
            });
        }
    }
}


module.exports = router;

