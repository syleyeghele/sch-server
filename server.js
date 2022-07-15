const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//Mysql DB connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      port: 8889,
      user : 'root',
      password : 'root',
      database : 'estyvida'
    }
  });

  // support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// cors connection
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.get('/', (req, res) => {
    res.status(200).send({message: 'on display'})
})

// to update password by user
app.post('/users/signup', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email.length + ',' + password)

    knex('users')
        .where({
            email: email
        })
        .then((response) => {

            let data = response[0]
            console.log(data)

            if (data) {
                if ( email.length === 0) {
                    res.status(200).send({status: 'failed', message: 'Please input valid email...'});
                } else {
                    if (password.length < 5 && typeof(password) != String) {
                        res.status(200).send({status: 'failed', message: 'Password is less than 5 characters...'});
                    } else  if (data.password === null ) {
                        if (response.length == 1) {
                            knex('users')
                            .where({email: email})
                            .update({
                                password: password
                            }) .then (() => {
                                res.status(200).send({status: 'success', message: 'Account created and password updated successfully...'});
                            })
                        } else {
                            res.status(200).send({status: 'failed', message: 'Email does not exist...'});
                        }
                    } else {
                        res.status(200).send({status: 'failed', message: 'Password already created, login to change password...'});
                    }
                }
            } else {
             res.status(200).send({status: 'failed', message: 'Email does not exist...'});   
            }
        })
})


// to add user/account by admin
app.post('/user/add', (req, res, next) => {
    let fname = req.body.fname;
        sname = req.body.sname;
        email = req.body.email;
        user_type = req.body.user_type
        cclass = req.body.cclass
        pname = req.body.pname
        phone = req.body.phone
        address = req.body.address
        dofb = req.body.dofb
        gender = req.body.gender

        idNum = Math.floor((Math.random() * 10000));
        user_id = 'estyvida/'+user_type+'/'+idNum

        knex('users').where({
            email: email
        }).then((response) => {
            if (gender.length < 4) {
                res.status(200).send({status: 'failed', message: 'Enter valid gender'});
            } else if (dofb.length < 5) {
                res.status(200).send({status: 'failed', message: 'Enter valid date of birth'});
            } else if (address.length < 10 ) {
                res.status(200).send({status: 'failed', message: 'Enter valid home address'});
            } else if (phone.length !== 11) {
                res.status(200).send({status: 'failed', message: 'Enter valid phone number'});
            } else if (pname.length < 6) {
                res.status(200).send({status: 'failed', message: 'Enter valid parents name'});
            } else if (fname.length < 3 ) {
                res.status(200).send({status: 'failed', message: 'Enter valid first name'});
            } else if (sname.length < 3) {
                res.status(200).send({status: 'failed', message: 'Enter valid surname'});
            } else if (email.length < 11) {
                res.status(200).send({status: 'failed', message: 'Enter valid email'});
            } else if (user_type == 'teacher' || user_type == 'student' || user_type == 'admin') {
                if ( cclass.length > 5) {
                    if ( response.length === 1) {
                        res.status(200).send({status: 'failed', message: 'Email already exist...'});
                    } else {
                            knex('users').insert({
                            fname: fname,
                            sname: sname,
                            user_type: user_type,
                            email: email,
                            user_id: user_id,
                            class: cclass,
                            pname: pname,
                            phone: phone,
                            address: address,
                            dofb: dofb,
                            gender: gender

                            }).then (() => {
                            res.status(200).send({status: 'success', message: 'User added successfully...'});
                        })
                    }
                } else {
                    res.status(200).send({status: 'failed', message: 'Select valid class'});
                }
            } else {
                res.status(200).send({status: 'failed', message: 'Enter valid user type'});
            }
        })
        
})



// to sigin
app.post('/users/signin', (req, res) => {
    let email = req.body.email;
    let password = req.body.password
    console.log(email+ ',' + password)

    knex('users')
    .where({
        email: email
    })

    .then( (response) => {

        let data = response[0]
        console.log(data)

        if ( data ) {
            if (data.password === password){
                res.status(200).send({status: 'success', message: 'Sign in successful...'});
            } else {
                res.status(200).send({status: 'failed', message: 'Incorrect password...'});
            }
        } else {
            res.status(200).send({status: 'failed', message: 'no user found...'});
        }
        
    })
})


//to get all students for overview page
app.get('/all_students', (req, res) => {
    knex('users')
    .where({
        user_type: 'student'
    })
    .then((response) => {
        let data = response
        res.status(200).send({status: 'success', data});
    })
})

//to get all teachers for overview page
app.get('/all_teachers', (req, res) => {
    knex('users')
    .where({
        user_type: 'teacher'
    })
    .then((response) => {
        let data = response
        res.status(200).send({status: 'success', data});
    })
})


//save notice to db
app.post('/notice', (req, res) => {
    let notice = req.body.notice;
    let email = req.body.noticeEmail
    let title = req.body.noticeTitle

    if (title.length < 8) {
        res.status(200).send({status: 'failed', message:'Please input title...'})
    } else {
        if (notice.length < 30) {
            res.status(200).send({status: 'failed', message:'Notice text not enough characters...'})
        } else {
            knex('users')
            .where({
                email: email
            }).then( (response) => {
                let data = response[0]
                let name = data.fname + ' ' + data.sname
        
                knex('notice')
                .insert({
                    name: name,
                    notice_text: notice,
                    email: email,
                    title: title
                }).then( (response) =>{
                    res.status(200).send({status: 'success', message:'Notice save successfully...'})
                })
            })
        }
    }
})


//get all notice from db
app.get('/get_notice', (req, res) => {
    knex('notice')
    .then((response) => {
        let datas = response
        
        let num1 = datas.length
        let num2 = datas.length - 3
        let data = datas.slice(num2, num1);
        res.status(200).send({status: 'success', data})
    })
})


// get notice for overview page
app.get('/overview_notice', (req, res) => {
    knex('notice')
    .then((response) => {
        let datas = response
        
        let num1 = datas.length - 1
        let data = datas.slice(num1);
        console.log(data)
        res.status(200).send({status: 'success', data})
    })
})

app.get('/get_all_teachers', (req, res) => {
    knex('users')
    .where({
        user_type: 'teacher'
    }).then( (response) => {
        let data = response
        res.status(200).send({status: 'success', data})
    })
})

app.get('/get_all_students', (req, res) => {
    knex('users')
    .where({
        user_type: 'student'
    }).then( (response) => {
        let data = response
        res.status(200).send({status: 'success', data})
    })
})

app.listen(4000, () => {
    console.log('server is running on port 4000!')
})