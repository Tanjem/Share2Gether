// const mysql = require("mysql");

// const pool = mysql.createPool({ //Connect to mysql
//     dateStrings: true,
//     host:     process.env.DATABASE_HOST,
//     user:     process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE
    
// });

// exports.viewProfile = (req, res) => {

//     pool.getConnection((err, connection) => {
//         if(err) throw err;

//         connection.query('SELECT * FROM tblaccount WHERE Id = ?', (err, rows) => {
//             if(!err) {
//                 res.render('user-profile', { rows });
//             }
//         });

//     });

// }

// exports.uploadFile = (req, res) => {

//     let sampleFile;
//     let uploadPath;

 
// }