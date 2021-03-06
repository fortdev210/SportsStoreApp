import React, { useState, Fragment , useEffect } from 'react';
import axios from 'axios';
import {
    MDBBtn,
    MDBTable,
    MDBTableBody,
    MDBTableHead,
    MDBTableFoot,
    MDBIcon,
    MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter,
    MDBInput
} from 'mdbreact';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './Users.module.css';
import Pagination from './Pagination';
import { signup } from '../actions/auth';
import { setAlert } from '../actions/alert';


const Users = () => {
    const [toggle, setToggle] = useState(false);
    const toggleModal = () => { setToggle(!toggle) };

    //////----------------For Creation of Users------------------------------////////
    const config = {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };
    const [errorMessage, setErrorMessage] = useState("");
    const [is_staff, setIsStaff] = useState(false);
    const onCheckStaff = (e) => {setIsStaff(!is_staff)};
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    })
    const { name, email, password, password2 } = formData;
    const onChange = e => setFormData({
        ...formData,
        [e.target.name]: e.target.value
    })
    const onSave = async(e) => {
        e.preventDefault();
        const body = {
            "name":name, "email":email,"password":password,"password2":password2,"is_staff":is_staff
        };
        if (password !== password2){
            setAlert('Passwords do not match.', 'warning');
        }
        else
        { 
            const res = await axios.post('/api/accounts/signup',body,config);
            if ("success" in res.data){
                toggleModal(false);         
                const res1 = await axios.get('/api/accounts/users/?page=1', config);
                setUsers(res1.data.results);
                setCount(res1.data.count); 
            }
            else{
                setErrorMessage(res.data.error);
            }   
        }
    }
    ///--------------- For pagination and display users-------------///
    const [users, setUsers] = useState([]);
    const [count, setCount] = useState(0);
    const [previous, setPrevious] = useState('');
    const [next, setNext] = useState('');
    const [active, setActive] = useState(1);

    const fetchData = async() => {
        try {
            const res = await axios.get('/api/accounts/users/?page=1', config);
            setUsers(res.data.results);
            setCount(res.data.count);
            setPrevious(res.data.previous);
            setNext(res.data.next);
        }
        catch (err) {
        }
    }
    useEffect(() => {
        window.scrollTo(0,0);
        fetchData();
    },[])
    const previous_number = () => {
        axios.get(previous, config)
        .then(res => {
            setUsers(res.data.results);
            setPrevious(res.data.previous);
            setNext(res.data.next);
            if (previous)
                setActive(active-1);
        })
        .catch(err => {

        })
    };
    const next_number = () => {
        axios.get(next, config)
        .then(res => {
            setUsers(res.data.results);
            setPrevious(res.data.previous);
            setNext(res.data.next);
            if (next)
                setActive(active+1);
        })
        .catch(err => {
            
        })
    }
    const visitPage = (page) => {
        axios.get(`/api/accounts/users/?page=${page}`,config)
        .then(res => {
            setUsers(res.data.results);
            setPrevious(res.data.previous);
            setNext(res.data.next);
            setActive(page);
        })
        .catch(err => {});
    };

    ///--------------------------------- For update-----------------------////
    const [update, setUpdate] = useState(0);

    const toggleUpdate = userid => { 
        setUpdate(userid);
        let selected_user = users.filter(function (el) { return el.id === userid })[0];
        if (selected_user !== undefined){
            setUpdateEmail(selected_user.email);
            setUpdateName(selected_user.name);
            setStaff(selected_user.is_staff);
        }
        else
            selected_user = {"name":"undefined","email":"undefined","is_staff":"undefined"}
            
    };
    const [ updateEmail, setUpdateEmail ] = useState("email");
    const [ updateName, setUpdateName ] = useState("name");
    
    const onChangeName = (e) => {
        setUpdateName(e.target.value)
    }
    const onChangeEmail = (e) => {
        setUpdateEmail(e.target.value)
    }
    const onUpdate = async (e) => {
        const body = {
            "name": updateName, "email":updateEmail,"is_staff":staff
        }
        const res = await axios.put(`/api/accounts/users/${update}/`, body, config);
        const res1 = await axios.get('/api/accounts/users/?page=1', config);
        toggleUpdate(0);
        setUsers(res1.data.results);    
    }
    ///---------------------------For remove---------------------------------////
    
    const onRemove = async(id) => {
        if(window.confirm("Are you sure to remove?")){
            const res = await axios.delete(`/api/accounts/users/${id}/`, config);
            const res1 = await axios.get('/api/accounts/users/?page=1', config);
            setUsers(res1.data.results);  
            setCount(res1.data.count);  
        }
    }
    ////-------------------For admin----------------------//////
    let is_admin = (localStorage.getItem('is_admin')==='true')
    const [staff, setStaff] = useState(false);
    const onCheck = () => setStaff(!staff);

    return (
        <div>
            <MDBBtn rounded color="success" className={styles.addbtn} onClick={toggleModal}><MDBIcon icon="plus-circle" />&nbsp;&nbsp;Add new user</MDBBtn>
            <MDBTable hover>
                <MDBTableHead>
                    <tr>
                        <th>id</th>
                        <th>Name</th>
                        {
                            is_admin?
                            <th>Status</th>
                            :
                            null
                        }
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {
                        users !== undefined?
                        users.map(user => {
                            return (<tr>
                            <td>{user.id}</td>
                            <td>
                                {update !== user.id ?
                                    user.name
                                :
                                <input value={updateName} onChange={onChangeName}/>
                                }
                            </td>
                            {
                                is_admin?
                                <td>
                                    <div class="custom-control custom-checkbox">
                                        {update === user.id ?
                                        <input type="checkbox" className="custom-control-input" id={`defaultUnchecked${user.id}`} checked={staff} name="checked" onChange={onCheck}/>:
                                        <input type="checkbox" className="custom-control-input disabled" />}
                                        <label class="custom-control-label" for={`defaultUnchecked${user.id}`}>Is Staff?</label>
                                    </div>
                                </td>
                                :
                                null
                            }
                            <td>
                                {update !== user.id ?
                                    user.email
                                :
                                <input value={updateEmail} onChange={onChangeEmail}/>
                                }
                            </td>
                            <td style={{ alignItems: "center" }}>     
                                {
                                    update !== user.id ?
                                    <Fragment>
                                        <MDBBtn color="info" className={styles.editbtn} onClick={()=>toggleUpdate(user.id)}><MDBIcon icon="user-edit" />&nbsp;&nbsp;Edit</MDBBtn>
                                        <MDBBtn color="dark" className={styles.editbtn} onClick={()=>onRemove(user.id)}><MDBIcon icon="user-minus" />&nbsp;&nbsp;Remove</MDBBtn>
                                    </Fragment>
                                    :
                                    <Fragment>
                                        <MDBBtn color="info" className={styles.editbtn} onClick={()=>toggleUpdate(0)}><MDBIcon icon="undo" />&nbsp;&nbsp;Undo</MDBBtn>
                                        <MDBBtn color="warning" className={styles.editbtn} onClick={onUpdate}><MDBIcon far icon="save"  />&nbsp;&nbsp;Save</MDBBtn>
                                    </Fragment>
                                }       
                            </td>
                        </tr>)
                        })
                        :
                        ""
                }
                </MDBTableBody>
                <MDBTableFoot>
                    <Pagination 
                        itemsPerPage = {5}
                        count = {count}
                        visitPage = {visitPage}
                        previous = {previous_number}
                        next = {next_number}
                        active = {active}
                        setActive = {setActive}
                    />
                </MDBTableFoot>
            </MDBTable>
            <MDBModal isOpen={toggle} toggle={toggleModal}>
                <MDBModalHeader toggle={toggleModal}>Add New User</MDBModalHeader>
                <MDBModalBody>
                    <p><span>{errorMessage}</span></p>
                    <form>
                        <div className="grey-text">
                            <MDBInput
                                label="User name"
                                icon="user"
                                group
                                type="text"
                                name="name"
                                value={name}
                                validate
                                error="wrong"
                                success="right"
                                onChange={e => onChange(e)}
                                required
                            />
                            {
                                is_admin?
                                <div class="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id='defaultUnchecked' checked={is_staff} name="checked" onChange={onCheckStaff}/>
                                    <label class="custom-control-label" for="defaultUnchecked">Is Staff?</label>
                                </div>
                                :
                                null
                            }
                            <MDBInput
                                label="User email"
                                icon="envelope"
                                group
                                type="email"
                                name="email"
                                value={email}
                                validate
                                error="wrong"
                                success="right"
                                onChange={e => onChange(e)}
                                required
                            />
                            <MDBInput
                                label="User password"
                                icon="lock"
                                group
                                type="password"
                                name="password"
                                value={password}
                                validate
                                onChange={e => onChange(e)}
                                required
                            />
                            <MDBInput
                                label="Confirm password"
                                icon="lock"
                                group
                                type="password"
                                name="password2"
                                value={password2}
                                validate
                                onChange={e => onChange(e)}
                                required
                            />
                        </div>
                    </form>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color="secondary" className={styles.editbtn} onClick={toggleModal}>Close</MDBBtn>
                    <MDBBtn color="primary" className={styles.editbtn} onClick={onSave}>Save changes</MDBBtn>
                </MDBModalFooter>
            </MDBModal>
        </div>
    )
}

Users.propTypes = {
    signup: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired
}
export default connect(null, {signup, setAlert})(Users);