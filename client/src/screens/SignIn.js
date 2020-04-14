import React, { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { authContext } from '../contexts/AuthContext';
import { apiUrl, authUrl } from '../constants/api.js';
import axios from 'axios';


const SignIn = ({history}) => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const { setAuthData } = useContext(authContext);

  const onFormSubmit = async(e) => {
    e.preventDefault();

    const userToken = await signInWithUsername();
    let isAdmin = null;
    if(userToken) isAdmin = await validateAdminAccess(userToken);

    if(isAdmin) {
        setAuthData({ username })
        history.replace('/')
    }
  };

  const signInWithUsername = () => {
      return axios.post(authUrl + 'token', {
          username: username,
          password: password,
      })
          .then((response) => {
              const userToken = response.data.token
              return userToken
         })
          .catch((err) => {
              alert("Username or password is invalid!")
              return undefined
          });
  }

  const validateAdminAccess = (userToken) => {
      return axios({
          method: "GET",
          url: apiUrl + 'current_user',
          headers: {'Authorization': 'Bearer ' + userToken},
      })
          .then((response) => {
              const role = response.data.roles[0]
              if(role === 'administrator') return true

              alert("You are not allowed to access")
              return false
         })
          .catch((err) => {
              return false
          });
  }

  return (
    <div
      style={{ height: "100vh" }}
      className="d-flex justify-content-center align-items-center"
    >
      <div style={{ width: 400 }}>
        <h2 className="text-center">Báo mới Press Notification</h2>
        <h4 className="text-center">Đăng nhập</h4>
        <Form onSubmit={onFormSubmit}>
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="username"
              placeholder="Enter username"
              onChange={e => {
                setUsername(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={e => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-3"
          >
            Sign In as Admin
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;