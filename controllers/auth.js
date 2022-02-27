const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { application } = require("express");


const pool = mysql.createPool({         //Creating Pool

    host:     process.env.DATABASE_HOST,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
    
});


exports.login = async (req, res)  => {

    pool.getConnection((err, connection) => {        

        try {

            //requesting "email & password" from login.hbs
            const { email, password } = req.body; 
            //Validation of input fields            
            if(!email || !password) {                         
                return res.status(401).render('login', {
                    message: 'You need email and password.'
                })
            }
    
    
            connection.query('SELECT * FROM tblaccount WHERE email = ?', [email], async (error, results) => {     
                //Comparing if passwords are same from login input field - database password
                const passwordMatches = await bcrypt.compare(password, results[0].Password)     
                //Validate if password do not match
                if (!results || !passwordMatches) {                                             
                    res.status(401).render('login', {
                        message: 'The email or password its incorrect'
                    })
                }        
                else {
                    const id = results[0].Id;

                    //assigning a cookie token to the User Id
                    const token = jwt.sign({ id }, process.env.JWT_SECRET, {                    
                        expiresIn: process.env.JWT_EXPIRE_IN
                    });
                    const cookieOptions = {
                        expires: new Date(
                            Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true,
                    }
                    res.cookie('jwt', token, cookieOptions);
                    res.cookie('id', id, cookieOptions)

                    if (results[0].email == "share2getherAdmin@gmail.com") {
                        res.status(200).redirect("/admin_page")                                
                    } else {
                        res.status(200).redirect("/user-profile")     
                    }
                            
                }

            })
            
        } catch (error) {
            
            console.log(error);
        }

    })

};




exports.register = async (req, res)  => {

    pool.getConnection((err, connection) => {


        //const name = req.body.name;
        //const email = req.body.email;
        //const password = req.body.password;
        //const passwordConfirm = req.body.passwordConfirm;
        //<DESTRUCTURING> --->
        const {f_name, l_name, dob, email, password, passwordConfirm, gender} = req.body;    
    
        connection.query('SELECT email FROM tblaccount WHERE email = ?', [email], async (error, results) => {
    
            
            if(error) {
                console.log(error);
            }

            //Validation if email already exists:
            if(results.length > 0) {                                   
    
                return res.render('register_profile', {
                    message: 'That email is already in use.'           
                })

            //Validation if Passwords do not match to each other:
            } else if(password !== passwordConfirm) {                  
      
                return res.render('register_profile', {
                    message: 'Passwords do not match.'
                })

            //Validation if first name and last name cannot be same
            } else if(f_name == l_name) {                               
    
                return res.render('register_profile',{
                    message: 'First name cannot be same as last name.'
                });
    
            }

            //Hashing password
            let hashedPassword = await bcrypt.hash(password, 8);        

            //Inserting Data into the Database query:
    
            connection.query('INSERT INTO tblaccount SET ?', {FName: f_name, SName: l_name, DOB: dob, email: email, Password: hashedPassword, Gender: gender }, (error,results) => {
    
                if(error) {
                    console.log(error);
                } else {
                  return res.render('register_profile', {
                    message: 'User registered'                            
                  });
                }
    
            });
    
        });

        
    });

};


exports.logout = (req,res) => {

    res.clearCookie('jwt');
    res.clearCookie('id')
    res.redirect('/login');

};