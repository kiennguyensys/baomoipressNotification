import fetch from "node-fetch";
import fs from "fs";
import FCM from "fcm-node";

const serverKey = 'AAAArKz-al0:APA91bEID_mgM9dN6WfcLrvbJjSe88uPEfCz6O1HlNIathDTxXVcsZzQJL8FOmDpZJoPMIS2VdcMKXMCmJyc8ONKLLxCOp3Shsr-5Nrg4mr4aJIZ2D22ACl_5_VbqcfnfpgsFtpd7oG_'

const fcm = new FCM(serverKey);
let localStorage;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./ServerLocalStorage');
}

export const fcmCronLatestPost = async () => {
  fetch("https://app.baomoi.press/wp-json/wp/v2/posts?per_page=1")
    .then(res => res.json())
    .then(json => {
        let title = json[0].title.plaintitle
        let body = json[0].excerpt.custom_excerpt
        let image = json[0].thumb
        let slug = json[0].slug

        let data = { title, body, image, slug }
        const latestPostID = localStorage.getItem('latestCronPostID');
        if(!latestPostID || (parseInt(latestPostID) !== json.id)) {
            sendNotif(data, [], 'news')
            localStorage.setItem('latestCronPostID', json[0].id.toString());
        }
    });
};

export const sendNotif = async (data, tokens, topics) => {
    const message = {
        to: (topics && topics.length) ? ('/topics/' + topics) : tokens,
        collapse_key: 'Hot News',
        priority: 'high',
        mutable_content: true,
        content_available: true,

        notification: {
            title: data.title,
            body: data.body,
            image: data.image || ""
        },

        data: {
            title: data.title,
            body: data.body,
            slug: data.slug || "",
            image_url: data.image || "",
        }
    };

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err)
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}
