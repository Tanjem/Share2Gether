const express = require("express"); 
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');                      
const bodyParser = require('body-parser');                         
const socketIO = require("socket.io");
const http = require("http");   
const fileUpload = require("express-fileupload");                                    

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
 
        socket.join(params.room);                                                     //Join Room variable "params.room"
        users.removeUser(socket.id);                                                  //Removes a user from any other room if joins a new room - users.js
        users.addUser(socket.id, params.name, params.room);                           //Creating a new user - users.js

        
        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));                              //Update user list - users.js & message_room.js
        socket.emit('newMessage', generateMessage('Admin', `Welcome to room ${params.room}!`));                  //Admin Message of welcome - message.js  & message_room.js
        
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));       //Message when new user Joins a room - message.js  & message_room.js

        callback();

    })


    socket.on('createMessage', (message, callback) => {                      

        let user = users.getUser(socket.id);                                  

        if(user && isRealString(message.text)) {                                                     
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));            //Generating message
        }

    });

    socket.on('disconnect', () => {                                          
        console.log('User was disconnected')
        let user = users.removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));                                            //Updating the user list & Remove
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))     //Displaying message to the chat user has left
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


//Parse URL-encoded bodies (as sent by HTLM forms) to make sure that we can grab the data from any FORMS html
app.use(express.urlencoded({extended: false}));
//Parse JSON bodies (as sent by API clients) the values that we are taking are json
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(fileUpload());



app.set('view engine', 'hbs')       //what kind of engine for our html

pool.getConnection((error) => {     //Validate if the server is connnected to mysql

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
// const userProfileRoutes = require('./routes/userProfileRoutes');


app.use('/', routes); // Connects and renders the different pages of html
app.use('/auth', authRoutes); // Connect values/data from the html to the auth file
app.use('/', userRoutes);
// app.use('/', userProfileRoutes);






// app.get('/user-profile', (req, res) => {
//     connection.query('SELECT * FROM tblaccount WHERE Id = 24', (err, rows) => {
//         if(!err) {
//             res.render('user-profile', { rows })
//         }
//     });
// });

// app.post('/user-profile', (req, res) => {

//     let sampleFile;
//     let uploadPath;

//     if(!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.')
//     }

//     sampleFile = req.files.sampleFile;
//     console.log(sampleFile);





// })






























server.listen(5069, () => {
    console.log("Server started on Port 5069"); // Connecting to the port starting server
});
