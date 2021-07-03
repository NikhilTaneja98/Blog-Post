const chalk = require('chalk');
var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'blogpost'
  });

connection.connect(function(err){
    if(err){
        throw err;
    }
    console.log(chalk.blueBright('Database Connected.'))
})

router.get('/', function(req, res){
    connection.query('SELECT * FROM BLOGLIST AS B ORDER BY STR_TO_DATE(B.createdAt, \'%d/%m/%Y\') DESC, B.title LIMIT 5', function(err, fields) {
        if(err){
            throw err;
        }
        console.log(fields);
        res.render('home', {data:fields});
    })
});

router.get('/favicon.ico', function(req, res) {
    res.sendStatus(404);
})

router.get('/view-all', function(req, res){
    connection.query('SELECT * FROM BLOGLIST AS B ORDER BY STR_TO_DATE(B.createdAt, \'%d/%m/%Y\') DESC, B.id DESC', function(err,fields) {
        if(err){
            throw err;
        }
        console.log(fields);
        res.render('bloglist', {data : fields});
    })
});

router.get('/write-blog', function(req, res) {
    res.render('add');
})

router.post('/add-new', function(req, res){
    //var writing = req.body.writing.replace('\'', '\\\'');
    //console.log(writing);
    connection.query(`INSERT INTO bloglist(title, author, createdAt, writing) VALUES (\'${req.body.title}\', \'${req.body.author}\', \'${new Date().toLocaleDateString()}\', \'${req.body.writing}\')`, function(err,results) {
        if(err){
            throw err;
        }
        console.log(results);
        var id = results.insertId;
        connection.query(`INSERT INTO likes(blogId) VALUES (${id})`, function(err, result) {
            if(err){
                throw err;
            }
        });
    })
    res.redirect('/');
});

router.get('/view/:id', function (req, res){
    connection.query(`SELECT * FROM bloglist WHERE id=${req.params.id}`, function (err, row) {
        if(err){
            throw err;
        }
        if(row.length == 0){
            res.render('error');
        }
        connection.query(`SELECT likesCount FROM likes WHERE blogid = ${req.params.id}`, function(err, count){
            if(err){
                throw err;
            }
            //res.send('l', count.likesCount);
            res.render('viewblog', {data :row, likes : count[0].likesCount});
        })
    })
});

//edit the post
router.get('/edit/:id', function(req, res){
    connection.query(`SELECT * FROM bloglist WHERE id=${req.params.id}`, function(err, result) {
        if(err){
            throw err;
        }
        if(result.length == 0){
            res.render('error');
        }
        connection.query(`SELECT likesCount FROM likes WHERE blogid = ${req.params.id}`, function(err, count){
            if(err){
                throw err;
            }
        })
        res.render('edit', {data : result});
    })
});

router.post('/edit-success', function(req, res) {
    console.log(req.body);
    connection.query(`UPDATE bloglist SET title=\'${req.body.title}\', author=\'${req.body.author}\', createdAt=\'${new Date().toLocaleDateString()}\', writing=\'${req.body.writing}\' WHERE id=${req.body.id}`, function(err) {
        if(err){
            throw err;
        }
        res.redirect('/');
    })
})

router.get('/delete-post/:id', function(req, res) {
    connection.query(`DELETE FROM likes WHERE blogid=${req.params.id}`, function(err, results) {
        if(err){
            throw err;
        }
        if(results.affectedRows == 0){
            res.render('error');
        }
        else{
            connection.query(`DELETE FROM bloglist WHERE id=${req.params.id}`, function(err, result) {
                if(err){
                    throw err;
                }
            })
            res.redirect('/');
        }
    })
    
});

router.post('/like/:id', function(req, res) {
    var id = req.params.id;
    connection.query(`UPDATE likes SET likesCount = likesCount + 1 WHERE blogId = ${req.params.id}`, function(err, result){
        if(err){
            throw err;
        }
        res.redirect('/view/'+id);
    })
})
module.exports = router;