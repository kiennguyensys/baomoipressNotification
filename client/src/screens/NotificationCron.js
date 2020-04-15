import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from 'axios';

const NotificationCron = ({history}) => {
  const [isCheckingCurrentTask, setCheckingCurrentTask] = useState(false)
  const [isTaskRunning, setTaskRunning] = useState(false)
  const [isServerError, setServerError] = useState(false)

  const checkCronjob = () => {
      setCheckingCurrentTask(true)

      axios.post('/fcm-cron', {
          action: "checkRunningTask"
      })
      .then(res => {
          const message = res.data
          setCheckingCurrentTask(false)

          if(message === "scheduled") {
              setTaskRunning(true)
          }

          if(message === "destroyed" || message === "null") {
              setTaskRunning(false)
          }
      })
      .catch(err => {
          console.log(err)
          setServerError(true)
      })
  }

  useEffect(() => {
      checkCronjob()
  }, []);

  const startCronjob = (e) => {
      e.preventDefault()
      axios.post('/fcm-cron', {
          action: "start"
      })
      .then(res => checkCronjob())
      .catch(err => console.log(err))
  }

  const destroyCronjob = (e) => {
      e.preventDefault()
      axios.post('/fcm-cron', {
          action: "destroy"
      })
      .then(res => checkCronjob())
      .catch(err => console.log(err))
  }

  return (
    <div
      style={{ height: "100vh" }}
      className="d-flex justify-content-center align-items-center"
    >
      <div style={{ width: 300 }}>
        <h1 className="text-center"> {`Cron Center`} </h1>
        <h6 className="text-center"> {`Cron latest post every 4 hours`} </h6>
        {!isServerError &&
        <div>
            {!isTaskRunning &&
            <Button
              variant="primary"
              type="button"
              className="w-100 mt-3"
              onClick={startCronjob}
            >
              Start
            </Button>
            }

            {isTaskRunning &&
            <Button
              variant="primary"
              type="button"
              className="w-100 mt-3"
              onClick={destroyCronjob}
            >
              STOP
            </Button>
            }

            {isCheckingCurrentTask && <p>Checking if task is running...</p>}
        </div>
        }

      </div>
    </div>
  );
};

export default NotificationCron;