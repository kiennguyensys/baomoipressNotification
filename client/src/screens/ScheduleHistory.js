import React, { useState, useEffect } from "react";
import { Button, ListGroup } from "react-bootstrap";
import axios from 'axios';
import cronstrue from 'cronstrue';


const ScheduleHistory = ({history}) => {
    const [scheduledPlans, setScheduledPlans] = useState([])

    const getScheduledPlans = () => {
        axios.post("/fcm-schedule-sender", {
            data : {
                scheduleAction: "checkCurrentTasks",
                scheduleData: {}
            }
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
            data : {
                scheduleAction: "deleteTask",
                scheduleData: { deleteTaskIndex: index }
            }
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
                    let dateTime = plan.scheduleData.dateTime
                    const cronExpression = plan.scheduleData.recurringExpression
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
                                    <em>Nội dung tiêu đề: {plan.title || ""}</em>
                                    <em>{(plan.scheduleAction === 'scheduled') ? formattedDT  : ""}</em>
                                    <em>{(plan.scheduleAction === 'recurring') ? formattedCron : ""}</em>
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