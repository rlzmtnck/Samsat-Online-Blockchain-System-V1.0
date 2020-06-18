var express = require('express');
var app = express();

var index = 1;
var ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const path = require('path');
var previous_hash = 'Genesis Hash'
const SHA256 = require('crypto-js/sha256');

const CryptoJS = require("crypto-js");

//import model
const BlockChain = require('./Blockhain');
const Block = require('./Block');

//initialize model
const blockchain = new BlockChain();


function generateSalt(index) {
	/**
	 * Generate salt berdasarkan index block dengan memasukannya
	 * kesebuah algoritma
	 * 
	 * @params int var index
	 * @return str var hash_pattern
	 * 
	 * */

	var pattern = Math.pow((2*index),3);
	var string_pattern = pattern.toString();
	var hash_pattern = SHA256(string_pattern).toString();
	return hash_pattern;
};
app.get('/', function(req, res, next) {
    // fetch and sort users collection by id in descending order
    req.db.collection('samsat').find().sort({"_id": -1}).toArray(function(err, result) {
        //if (err) return console.log(err)
        if (err) {
            req.flash('error', err)
            res.render('samsat/listdata', {
                title: 'List Data | Samsat Online',
                data: ''
            })
        } else {
            // render to views/user/list.ejs template file
            res.render('samsat/listdata', {
                title: 'List Data | Samsat Online',
                data: result
            })
        }
    })
})
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){
    // render to views/user/add.ejs
    res.render('samsat/add', {
        title: 'Add Data',
        nopol: '',
        nama: '',
        alamat: '',
        phone:''
    })
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){
    req.assert('nopol', 'Nopol is required').notEmpty()           //Validate name
    req.assert('nama', 'Nama is required').notEmpty()             //Validate age
    req.assert('alamat', 'A valid address is required').notEmpty()  //Validate email
    req.assert('phone', 'Phone is required').notEmpty()
    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!

        /********************************************
         * Express-validator module

        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';

        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var dateobj = new Date();
		const timestamp = dateobj.toUTCString();

		var salt = generateSalt(docs);

		var nonce = SHA256(docs + salt).toString();
		const hash = SHA256(index.toString() + docs + timestamp + nonce + previous_hash).toString();
    
		const local_block = {
			'index' : index,
			'timestamp' : timestamp,
			'nonce' : nonce,
			'hash' : hash,
			'previous_hash' : previous_hash
		};
        
		const block = new Block(local_block.index,  local_block.timestamp, local_block.nonce, local_block.hash, local_block.previous_hash);
		
        var previous_block = blockchain.getNewestBlockFromBlockchain();
        
        var docs = {
            nopol: req.sanitize('nopol').escape().trim(),
            nama: req.sanitize('nama').escape().trim(),
            alamat: req.sanitize('alamat').escape().trim(),
            phone : req.sanitize('phone').escape().trim(),
            block

            
        }
        console.log(docs);
        previous_hash = hash;
        index = index + 1;
        req.db.collection('samsat').insert(docs, function(err, result) {
            if (err) {
                req.flash('error', err)

                // render to views/user/add.ejs
                res.render('samsat/add', {
                    title: 'Tambah Data Baru | Samsat Online',
                    nopol: docs.nopol,
                    nama: docs.nama,
                    alamat: docs.alamat,
                    phone: docs.phone,
                    block: docs.block
                })
            } else {
                req.flash('success', 'Data Berhasil Ditambah!')

                // redirect to user list page
                res.redirect('/samsat')

                // render to views/user/add.ejs
                /*res.render('user/add', {
                    title: 'Add New User',
                    name: '',
                    age: '',
                    email: ''
                })*/
            }
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name
         * because req.param('name') is deprecated
         */
        res.render('samsat/add', {
            title: 'Tambah Data Baru | Samsat Online',
            nopol: req.body.nopol,
            nama: req.body.nama,
            alamat: req.body.alamat,
            phone: req.body.phone
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('samsat').find({"_id": o_id}).toArray(function(err, result) {
        if(err) return console.log(err)

        // if user not found
        if (!result) {
            req.flash('error', 'Data tidak ada dengan id = ' + req.params.id)
            res.redirect('/samsat')
        }
        else { // if user found
            // render to views/user/edit.ejs template file
            res.render('samsat/edit', {
                title: 'Edit Data | Samsat Online',
                //data: rows[0],
                id: result[0]._id,
                nopol: result[0].nopol,
                nama: result[0].nama,
                alamat: result[0].alamat,
                phone: result[0].phone,
                hash: result[0].hash,
                timestamp: result[0].timestamp
            })
        }
    })
})

// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
  req.assert('nopol', 'Nopol is required').notEmpty()           //Validate name
  req.assert('nama', 'Nama is required').notEmpty()             //Validate age
  req.assert('alamat', 'A valid address is required').notEmpty()  //Validate email
  req.assert('phone', 'Phone is required').notEmpty()


    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!

        /********************************************
         * Express-validator module

        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';

        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
       var dateobj = new Date();
		const timestamp = dateobj.toUTCString();

		var salt = generateSalt(docs);

		var nonce = SHA256(docs + salt).toString();
		const hash = SHA256(index.toString() + docs + timestamp + nonce + previous_hash).toString();

		const local_block = {
			'index' : index,
			'timestamp' : timestamp,
			'nonce' : nonce,
			'hash' : hash,
			'previous_hash' : previous_hash
		};
        
		const block = new Block(local_block.index, local_block.timestamp, local_block.nonce, local_block.hash, local_block.previous_hash);
		
        var previous_block = blockchain.getNewestBlockFromBlockchain();
        var docs = {
            nopol: req.sanitize('nopol').escape().trim(),
            nama: req.sanitize('nama').escape().trim(),
            alamat: req.sanitize('alamat').escape().trim(),
            phone : req.sanitize('phone').escape().trim(),
            block

            
        }
        var o_id = new ObjectId(req.params.id)
        req.db.collection('samsat').update({"_id": o_id}, docs, function(err, result) {
            if (err) {
                req.flash('error', err)

                // render to views/user/edit.ejs
                res.render('user/edit', {
                    title: 'Edit User',
                    id: req.params.id,
                    nopol: req.body.nopol,
                    nama: req.body.nama,
                    alamat: req.body.alamat,
                    phone: req.body.phone
                })
            } else {
                req.flash('success', 'Data berhasil diupdate!')

                res.redirect('/samsat')

                // render to views/user/edit.ejs
                /*res.render('user/edit', {
                    title: 'Edit User',
                    id: req.params.id,
                    name: req.body.name,
                    age: req.body.age,
                    email: req.body.email
                })*/
            }
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name
         * because req.param('name') is deprecated
         */
        res.render('samsat/edit', {
            title: 'Edit Data',
            id: req.params.id,
            nopol: req.body.nopol,
            nama: req.body.nama,
            alamat: req.body.alamat,
            phone:req.body.phone

        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
    var o_id = new ObjectId(req.params.id)
    req.db.collection('samsat').remove({"_id": o_id}, function(err, result) {
        if (err) {
            req.flash('error', err)
            // redirect to users list page
            res.redirect('/samsat')
        } else {
            req.flash('success', 'Data telah terhapus! id = ' + req.params.id)
            // redirect to users list page
            res.redirect('/samsat')
        }
    })
})

module.exports = app;
