const mysql = require("mysql");

const pool = mysql.createPool({ //Connect to mysql
    dateStrings: true,
    host:     process.env.DATABASE_HOST,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
    
});

exports.view = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('SELECT * FROM tblaccount', (err, rows) => {

            if(!err) {
                let removedUser = req.query.removed;
                res.render('admin_page', { rows, removedUser });
            } else {
                console.log(err);
            }

        });
    });
}


exports.find = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        let searchTerm = req.body.search;

        connection.query('SELECT * FROM tblaccount WHERE FName LIKE ? OR SName LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            if(!err) {
                res.render('admin_page', { rows });
            } else {
                console.log(err);
            }

        });
    });

}

exports.form = (req, res) => {
    res.render('add-user');
}

exports.create = (req, res) => {

    const { FName, SName, DOB, email } = req.body;

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('INSERT INTO tblaccount SET FName = ?, SName = ?, DOB = ?, email = ?',[FName, SName, DOB, email], (err, rows) => {

            connection.release();

            if(!err) {
                res.render('add-user', { alert: 'User added successfully'});
            } else {
                console.log(err);
            }

        });
    });

}

exports.edit = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('SELECT * FROM tblaccount WHERE Id = ?', [req.params.Id], (err, rows) => {

            connection.release();

            if(!err) {
                res.render('edit-user', { rows });
            } else {
                console.log(err);
            }

        });
    });

}

exports.update = (req, res) => {

    const { FName, SName, DOB, email, Gender } = req.body;

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('UPDATE tblaccount SET FName = ?, SName = ?, DOB = ?, email = ?, Gender = ? WHERE Id = ?', [FName, SName, DOB, email, Gender, req.params.Id], (err, rows) => {

            connection.release();

            if(!err) {

                pool.getConnection((err, connection) => {
                    if(err) throw err;
            
                    connection.query('SELECT * FROM tblaccount WHERE Id = ?', [req.params.Id], (err, rows) => {
            
                        connection.release();
            
                        if(!err) {
                            res.render('edit-user', { rows, alert: `${FName} has been updated` });
                        } else {
                            console.log(err);
                        }
                        
                    });
                });

            } else {
                console.log(err);
            }

        });
    });

}


exports.delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('DELETE FROM tblaccount WHERE Id = ?', [req.params.Id], (err, rows) => {

            connection.release();

            if(!err) {
                let removeUser = encodeURIComponent('User successfully removed.');
                res.redirect('admin_page/?removed=' + removeUser);
            } else {
                console.log(err);
            }

        });
    });

}

exports.viewall = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        connection.query('SELECT * FROM tblaccount WHERE Id = ?', [req.params.Id], (err, rows) => {

            if(!err) {
                res.render('view-user', { rows });
            } else {
                console.log(err);
            }

        });
    });
}

exports.profile = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;

        id = req.cookies['id']
        connection.query('SELECT * FROM tblaccount WHERE id = ?', [id], (err, rows) => {
            if(!err) {
                res.render('user-profile', { rows });
            }
        });

    });

}

exports.uploadpic = (req, res) => {


    pool.getConnection((err, connection) => {
        if(err) throw err;

        id = req.cookies['id']

        let sampleFile;
        let uploadPath;

        if(!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        } 

        //name of the input is sampleFile.name
        sampleFile = req.files.sampleFile;
        uploadPath = 'upload/' + sampleFile.name;

        //Use mv() to place file on the server
        sampleFile.mv(uploadPath, function(err) {
            if(err) return res.status(500).send(err);

            connection.query('UPDATE tblaccount SET profile_image = ? WHERE id = ?', [sampleFile.name, id], (err, rows) => {

                if(!err) {
                    res.redirect('user-profile');
                } else {
                    console.log(err);
                }
            });

        });


    });


}