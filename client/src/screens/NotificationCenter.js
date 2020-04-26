import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
    Dropdown,
    DropdownButton,
    Form,
    Row,
    Col,
    Button,
    ProgressBar,
    Spinner,
    Modal
} from 'react-bootstrap';
import axios from 'axios';
import { apiUrl } from '../constants/api';
import DateTimePicker from 'react-datetime-picker';
import CronBuilder from 'react-cron-builder';
import 'react-cron-builder/dist/bundle.css';


const NotificationCenter = ({history}) => {
    const [title, setTitle] = useState()
    const [body, setBody] = useState()
    const [imageURL, setImageURL] = useState()
    const [slugData, setSlugData] = useState()

    const [recipientOption, setRecipientOption] = useState()
    const [singleFCMToken, setSingleFCMToken] = useState()
    const [gender, setGender] = useState()
    const [allHobbyChoices, setAllHobbyChoices] = useState([])
    const [hobby, setHobby] = useState()
    const [ageRange, setAgeRange] = useState()
    const [validRecipientsNumber, setValidRecipientsNumber] = useState(0)
    const [isCheckingValidRecipients, setCheckingValidRecipients] = useState(false)
    const [filterQuery, setFilterQuery] = useState()
    const [sendingProgress, setSendingProgress] = useState(0)

    const [scheduleOption, setScheduleOption] = useState()
    const [scheduleDateTime, setScheduleDateTime] = useState(new Date())
    const [scheduleRecurringExpression, setScheduleRecurringExpression] = useState('* * * * * * *')
    const [modalShow, setModalShow] = useState(false)


    const firstUpdate = useRef(true);

    useEffect(() => {
        getAllHobbyChoices()
    }, []);

    useLayoutEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
        setCheckingValidRecipients(true)
        checkValidRecipients()
    }, [hobby, gender, ageRange]);

    const getAllHobbyChoices = () => {
        axios({
            method: "GET",
            url: apiUrl + "get_hobby_choices",
        })
        .then(res => {
            setAllHobbyChoices(res.data)
        })
        .catch(err => console.log(err))
    }

    const onChangeRecipientRadio = (e) => {
        setRecipientOption(e.target.id)
    }

    const checkValidRecipients = () => {
        const generalQuery = apiUrl + "users?per_page=1"
        let genderQuery = ""
        let hobbyQuery = ""
        let ageRangeQuery = ""
        let queryOrder = 0

        if(gender) {
            genderQuery = "&filter[meta_query][" + queryOrder + "][key]=gender&filter[meta_query][" + queryOrder + "][value]=" + gender.toString()
            queryOrder++
        }

        if(hobby) {
            hobbyQuery = "&filter[meta_query][" + queryOrder + "][key]=so_thich&filter[meta_query][" + queryOrder + "][value]=" + hobby.toString()
            queryOrder++
        }

        if(ageRange) {
            ageRangeQuery = "&filter[meta_query][" + queryOrder + "][key]=age&filter[meta_query][" + queryOrder + "][value]=" + ageRange.split("-")[0] + "&filter[meta_query][" + queryOrder + "][compare]=>"
            queryOrder++
            ageRangeQuery = ageRangeQuery + "&filter[meta_query][" + queryOrder + "][key]=age&filter[meta_query][" + queryOrder + "][value]=" + ageRange.split("-")[1] + "&filter[meta_query][" + queryOrder + "][compare]=<="
        }

        //set query for later API calling
        setFilterQuery(genderQuery + hobbyQuery + ageRangeQuery)

        axios.get(generalQuery + genderQuery + hobbyQuery + ageRangeQuery)
        .then(res => {
            setValidRecipientsNumber(res.headers["x-wp-total"])
            setCheckingValidRecipients(false)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const onSendFilterRecipients = async() => {

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
                    setSendingProgress((batchNumber + 1) / (validRecipientsNumber/1000 + 1) * 100)

                    sendScheduleNotifsToServer(fcmTokensBatch)
                });
            }
        }
    }

    const sendScheduleNotifsToServer = (tokens, topics) => {
        const notificationData = { title, body, slug: slugData, image: imageURL }
        const scheduleData = { scheduleOption, scheduleDateTime, scheduleRecurringExpression }
        const recipientData = { recipientOption, singleFCMToken, filterQuery }
        console.log(JSON.stringify({ notificationData, scheduleData, recipientData }))

        axios.post("/fcm-schedule-sender", {
            notificationData: notificationData,
            scheduleData: scheduleData,
            recipientData: recipientData,
            action: 'createPlan'
        })
            .then(res => {
                console.log(res.data)
                setSendingProgress(0)
            })
            .catch(err => console.log(err))
    }


    const onChangeScheduleRadio = (e) => {
        setScheduleOption(e.target.id)
        if(e.target.id === 'recurring') setModalShow(true)
    }

    const onChangeScheduleDateTime = (newDate) => {
        setScheduleDateTime(newDate)
    }

    const onChangeScheduleRecurringExpression = (value) => {
        setScheduleRecurringExpression(value)
    }

    const onPressSendButton = () => {
        setSendingProgress(100)
        sendScheduleNotifsToServer()
    }

    const onNavigateScheduleHistory = () => {
        history.push('/schedule-history')
    }


    return(
        <div
          style={{ height: "100vh", marginTop: 10 }}
          className="d-flex flex-row justify-content-center align-items-center"
        >
            <div
                style={{ position: 'absolute', top: 20, right: 20 }}
            >
                <Button variant="link" onClick={onNavigateScheduleHistory}>Lịch sử kế hoạch >></Button>
            </div>

            <div
                style={{ height: 350, width: 320, marginRight: 20, borderStyle:"ridge" ,borderWidth: 1, borderRadius: 10, padding: 20, overflow: 'scroll' }}
            >
                <Form>
                  <Form.Group as={Row} controlId="formTitle">
                    <Form.Label column sm={2}>
                      Title
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Control required type="text" placeholder="Title" onChange={e => setTitle(e.target.value)} />
                    </Col>
                  </Form.Group>

                  <Form.Group controlId="formBody">
                    <Form.Label>Body</Form.Label>
                    <Form.Control required as="textarea" rows="3" placeholder="Body" onChange={e => setBody(e.target.value)} />
                  </Form.Group>

                  <Form.Group as={Row} controlId="formImageURL">
                    <Form.Label column sm={2}>
                      Image
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Control type="text" placeholder="Image Url(not required)" onChange={e => setImageURL(e.target.value)} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="formSlugData">
                    <Form.Label column sm={2}>
                      Slug
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Control type="text" placeholder="Slug Data(not required)" onChange={e => setSlugData(e.target.value)} />
                    </Col>
                  </Form.Group>
                </Form>
            </div>
            <div
                style={{ height: 350, width: 320, marginHorizontal: 20, borderStyle:"ridge" ,borderWidth: 1, borderRadius: 10, padding: 20, overflow: 'scroll' }}
            >
                <fieldset>
                  <Form.Group as={Row}>
                    <Form.Label as="legend" column sm={2}>
                      Gửi cho
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Check
                        type="radio"
                        label="Một đối tượng"
                        name="recipientOption"
                        id="singleRecipient"
                        onChange={onChangeRecipientRadio}
                      />
                      <Form.Check
                        type="radio"
                        label="Nhóm đối tượng"
                        name="recipientOption"
                        id="filterRecipients"
                        onChange={onChangeRecipientRadio}
                      />
                      <Form.Check
                        type="radio"
                        label="Tất cả"
                        name="recipientOption"
                        id="allRecipients"
                        onChange={onChangeRecipientRadio}
                      />
                    </Col>
                  </Form.Group>
                </fieldset>

                {recipientOption === 'singleRecipient' &&
                    <Form>
                        <Form.Group as={Row} controlId="formFCMToken">
                          <Form.Label column sm={2}>
                            Token
                          </Form.Label>
                          <Col sm={10}>
                            <Form.Control type="text" placeholder="FCM Token" onChange={e => setSingleFCMToken(e.target.value)} />
                          </Col>
                        </Form.Group>
                    </Form>
                }

                {recipientOption === 'filterRecipients' &&
                <div
                   className="d-flex flex-row justify-content-space-between align-items-start"
                 >
                    <div
                        style={{ marginRight: 10 }}
                    >
                        <DropdownButton
                          id="dropdown-hobby"
                          title="Lọc sở thích"
                          onSelect={e => setHobby(e)}
                        >
                          {allHobbyChoices.map((item, index) => (
                           <Dropdown.Item eventKey={item} key={index}>{item}</Dropdown.Item>
                          ))}
                        </DropdownButton>

                        <DropdownButton
                          id="dropdown-gender"
                          style={{ marginTop: 10 }}
                          title="Lọc giới tính"
                          onSelect={e => setGender(e)}
                        >
                          <Dropdown.Item eventKey="Nam">Nam</Dropdown.Item>
                          <Dropdown.Item eventKey="Nữ">Nữ</Dropdown.Item>
                        </DropdownButton>

                        <DropdownButton
                          id="dropdown-ageRange"
                          style={{ marginTop: 10, marginBottom: 10 }}
                          title="Lọc độ tuổi"
                          onSelect={e => setAgeRange(e)}
                        >
                          <Dropdown.Item eventKey="0-25">0-25</Dropdown.Item>
                          <Dropdown.Item eventKey="25-40">25-40</Dropdown.Item>
                          <Dropdown.Item eventKey="40-55">40-55</Dropdown.Item>
                          <Dropdown.Item eventKey="55-99">55-99</Dropdown.Item>
                        </DropdownButton>

                    </div>
                    <div
                        style={{ marginLeft: 10 }}
                    >
                        <div className="d-flex flex-row align-items-center">
                            <h6> {validRecipientsNumber} valid users </h6>
                            {isCheckingValidRecipients && <Spinner animation="grow" /> }
                        </div>

                        <p>
                            {hobby && <em> có sở thích: {hobby} <br/></em> }

                            {gender && <em> có giới tính: {gender} <br/></em> }
                            {ageRange && <em> có độ tuổi: {ageRange} </em> }
                        </p>

                        <Button variant="primary"
                            onClick={e => {
                                setHobby(null)
                                setGender(null)
                                setAgeRange(null)
                                setSendingProgress(0)
                            }}
                        >
                            Huỷ lọc
                        </Button>

                    </div>
                </div>
                }

            </div>

            <div
                style={{ height: 350, width: 320, marginLeft: 20, borderStyle:"ridge" ,borderWidth: 1, borderRadius: 10, padding: 20, overflow: 'scroll' }}
            >
                <fieldset>
                  <Form.Group as={Row}>
                    <Form.Label as="legend" column sm={2}>
                      Kế hoạch
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Check
                        type="radio"
                        label="Now"
                        name="scheduleOption"
                        id="now"
                        onChange={onChangeScheduleRadio}
                      />
                      <Form.Check
                        type="radio"
                        label="Scheduled"
                        name="scheduleOption"
                        id="scheduled"
                        onChange={onChangeScheduleRadio}
                      />
                      <Form.Check
                        type="radio"
                        label="Recurring"
                        name="scheduleOption"
                        id="recurring"
                        onChange={onChangeScheduleRadio}
                      />
                    </Col>
                  </Form.Group>
                </fieldset>

                {scheduleOption === 'scheduled' &&
                <div
                 style={{ marginBottom: 20 }}
                 >
                    <DateTimePicker
                      onChange={onChangeScheduleDateTime}
                      value={scheduleDateTime}
                    />
                </div>
                }

                <Modal
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  size="lg"
                  aria-labelledby="example-custom-modal-styling-title"
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                      Recurring Builder
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <CronBuilder
                        cronExpression={scheduleRecurringExpression}
                        onChange={onChangeScheduleRecurringExpression}
                        showResult={true}
                    />
                  </Modal.Body>
                </Modal>
                {scheduleOption === 'recurring' &&
                <p>
                    {scheduleRecurringExpression}
                </p>
                }

                <ProgressBar now={sendingProgress} />
                {(!sendingProgress || recipientOption !== 'filterRecipients') &&
                <Button variant="primary" onClick={onPressSendButton} style={{ marginTop: 10 }}>
                    Send!
                </Button>
                }

            </div>



        </div>
    )
}

export default NotificationCenter;
