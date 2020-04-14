import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { authContext } from "../contexts/AuthContext";

const Panel = ({history}) => {
  const { setAuthData, auth } = useContext(authContext);

  const onLogOut = () => {
    setAuthData(null);
  }

  const switchToNotificationCenter = () => {
      history.push('/notification-sender')
  }

  const switchToNotificationCron = () => {
      history.push('/notification-cron')
  }

  return (
    <div
      style={{ height: "100vh" }}
      className="d-flex justify-content-center align-items-center"
    >
      <div style={{ width: 300 }}>
        <h1 className="text-center"> {`Hello, ${auth.data.username}`} </h1>
        <Button
          variant="primary"
          type="button"
          className="w-100 mt-3"
          onClick={switchToNotificationCenter}
        >
          Gửi thông báo
        </Button>

        <Button
          variant="primary"
          type="button"
          className="w-100 mt-3"
          onClick={switchToNotificationCron}
        >
          Cron thông báo
        </Button>

        <Button
          variant="primary"
          type="button"
          className="w-100 mt-5"
          onClick={onLogOut}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Panel;