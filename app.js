const express = require("express"); 
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');                      
const bodyParser = require('body-parser');                         
const socketIO = require("socket.io");
const http = require("http");   
const fileUpload = require("express-fileupload");
const nodemailer = require('nodemailer');                                    

const { generateMessage } = require("./public/utils/message");      
const { isRealString } = require('./public/utils/isRealString')     
const {Users} = require('./public/utils/users');                    
const { callbackify } = require("util");


//start the server
const app = express();
//Create New User                                              
const users = new Users();                                          
const server = http.createServer(app)   
//start socket.io server                
const io = socketIO(server)       
                                  
//Connect to the .env file
dotenv.config({ path: './.env'});                                   


//Listening for an event "connection"
io.on('connection', (socket) => {                                           
    console.log('New user just connected')                          

    socket.on('join', (params, callback) => {                                                                       

        //Validating if "room" and "name" are in the input field - isRealString.js
        if(!isRealString(params.name) || !isRealString(params.room)) {                
            return callback('Name and room are required');
        }
         //Join Room variable "params.room"
        socket.join(params.room);       
        //Removes a user from any other room if joins a new room                                            
        users.removeUser(socket.id);                 
        //Creating a new user                             
        users.addUser(socket.id, params.name, params.room);                           

        //Update user list
        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));   
        //Admin Message of welcome                          
        socket.emit('newMessage', generateMessage('Admin', `Welcome to room ${params.room}!`));                  
        //Message when new user Joins a room
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));       

        callback();

    })


    socket.on('createMessage', (message, callback) => {                      

        let user = users.getUser(socket.id);                                  

        //generating messages between users
        if(user && isRealString(message.text)) {                                                     
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));          
        }

    });

    socket.on('disconnect', () => {                                          
        console.log('User was disconnected')
        let user = users.removeUser(socket.id);

        if(user) {
            //Updating the user list & Remove
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));     
            //Displaying message to the chat user has left                                       
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))     
        }

    });

    socket.on('playerEvent', function(event) {
        io.emit('playerEvent', event)
    });

    socket.on('videoEvent', function(event) {
        io.emit('videoEvent', event)
    });

});

//Creating mysql Pool
const pool = mysql.createPool({                                   

    host:     process.env.DATABASE_HOST,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE

});

const publicDirectory = path.join(__dirname, './public')            //Default start at "public" folder
app.use(express.static(publicDirectory));                           //to give express access to the publicdirectory
app.use(express.static('upload'));

//Parse URL-encoded bodies (as sent by HTLM forms) to make sure that we can grab the data from any FORMS html
app.use(express.urlencoded({extended: false}));
//Parse JSON bodies (as sent by API clients) the values that we are taking are json
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(fileUpload());


//engine for html
app.set('view engine', 'hbs')       

//Validate if the server is connnected to mysql
pool.getConnection((error) => {     

    if(error) {
        console.log(error)
    } else {
        console.log("MSQL Connected...")
    }

});


// Define Routes
const routes = require('./routes/pages');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const router = require("./routes/auth");

// Connects and renders the different pages of html
app.use('/', routes); 
// Connect values/data from the html to the auth file
app.use('/auth', authRoutes); 
app.use('/', userRoutes);

const port = process.env.PORT || 5069
server.listen(port, () => {
    console.log(`Server started on Port ${port}`); // Connecting to the port starting server
});


app.post('/contact_admin', (req, res) => {

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'share2gether.test@gmail.com',
            pass: 'share2gether123'
        }
    })

    const mailOptions = {
        from: req.body.email,
        to: 'share2gether.test@gmail.com',
        subject: `Message from ${req.body.email}: ${req.body.subject}`,
        text: req.body.message
    }

    transport.sendMail(mailOptions, (error, info)=> {
        if(error) {
            console.log(error);
            res.send('error')
        } else {
            console.log('Email sent: ' + info.response);
            res.send('success')
        }
    })

})