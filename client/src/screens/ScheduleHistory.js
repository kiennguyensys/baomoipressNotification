import React, { useState, useEffect } from "react";
import { Button, ListGroup } from "react-bootstrap";
import axios from 'axios';
import cronstrue from 'cronstrue';

const ScheduleHistory = ({history}) => {
    // const sampleData = '{"notificationData":{"title":"Đẹp mê hồn với Mercedes Vision AVTR Concept - Siêu xe phá vỡ ranh giới phim viễn tưởng và đời thực","body":"Bộ phim 3D đầu tiên được công chiếu trên toàn cầu là Avatar chính là nguồn cảm hứng cho Mercedes chế tạo concept Vision AVTR.","slug":"dep-me-hon-voi-mercedes-vision-avtr-concept-sieu-xe-pha-vo-ranh-gioi-phim-vien-tuong-va-doi-thuc","image":"https://autopro8.mediacdn.vn/zoom/600_315/2020/1/7/mercedes-benz-vision-avtr-concept-6-1578389310819268816611-crop-1578389358230493357210.jpg"},"scheduleData":{"scheduleOption":"scheduled","scheduleDateTime":"2020-04-27T00:43:00.000Z","scheduleRecurringExpression":"* * * * * * *"},"recipientData":{"recipientOption":"filterRecipients","filterQuery":"&filter[meta_query][0][key]=so_thich&filter[meta_query][0][value]=Movies"}}'

    const [scheduledPlans, setScheduledPlans] = useState([])

    const getScheduledPlans = () => {
        axios.post("/fcm-schedule-sender", {
            action: "getPlans"
        })
            .then(res => {
                setScheduledPlans(res.data)
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getScheduledPlans()
    }, [])

    const onDeletePlan = (index) => {
        axios.post("/fcm-schedule-sender", {
            action: "deletePlan",
            deletePlanIndex: index
        })
            .then(res => {
                getScheduledPlans()
            })
            .catch(err => console.log(err))
    }

    return (
        <div
            style={{ height: "100vh" }}
            className="d-flex flex-column justify-content-center align-items-center"
        >
            <div style={{ width: 500 }}>
                <h1 className="text-center"> {`Các kế hoạch đã tạo`} </h1>
                <h6 className="text-center"> {`Không bao gồm kế hoạch được gửi lập tức`} </h6>
            </div>

            <ListGroup variant="flush">
                {scheduledPlans.map((plan, idx) => {
                    const title = plan.notificationData.title.slice(0, 40) + "..."
                    const recipientOption = plan.recipientData.recipientOption
                    const recipientText = (recipientOption === 'singleRecipient') ? '1 người' : ((recipientOption === 'filterRecipients') ? 'Nhóm người ' : 'Tất cả')

                    let dateTime = plan.scheduleData.scheduleDateTime
                    const cronExpression = plan.scheduleData.scheduleRecurringExpression
                    let formattedDT, formattedCron;

                    if(dateTime)
                        dateTime = new Date(dateTime)
                        formattedDT = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate() + " " + dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds()

                    if(cronExpression)
                        formattedCron = cronstrue.toString(cronExpression)

                    return(
                        <ListGroup.Item key={idx}>
                            <div
                                className="d-flex flex-row justify-content-between align-items-center"
                            >
                                <div
                                    className="d-flex flex-column justify-content-between align-items-center"
                                >
                                    <em>Tiêu đề: {title || ""}</em>
                                    <em>Đối tượng nhận: {recipientText || ""}</em>
                                    <em>{(plan.scheduleData.scheduleOption === 'scheduled') ? "Gửi theo lịch: " + formattedDT  : ""}</em>
                                    <em>{(plan.scheduleData.scheduleOption === 'recurring') ? "Gửi lặp lại: " + formattedCron : ""}</em>
                                </div>
                                <Button style={{ marginLeft: 10 }} variant="danger" onClick={(e) => { onDeletePlan(idx) }}>Xoá</Button>
                            </div>
                        </ListGroup.Item>
                    )
                })
                }
            </ListGroup>



      </div>
    );
};

export default ScheduleHistory;