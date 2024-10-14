/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require("mongoose");

const database = process.env["MONGO_URI"];

mongoose.connect(database).then(() => console.log("connected to database"));

const LibrarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: {type: [String]}
})

const libraryModel = mongoose.model("LibrarySchema", LibrarySchema);



module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      await libraryModel.find({}).exec().then((items) => {
        if (items.length == 0) {
          res.send('no book exists');
          return
        } else {
          let books = items.map((item) => {
            return {
              _id: item._id,
              title: item.title,
              commentcount: item.comments.length
            }
          })
          console.log(books.length)
          res.json(books)
        }
      });
      // console.log(books.length);
      
      // if (!books.length == 0) {
      //   res.send('no book exists');
      //   return
      // }

      // res.send(books)
    })
    
    .post(function (req, res){
      let bookTitle = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!bookTitle) {
        res.send('missing required field title')
        return
      }

      let book = new libraryModel({title: bookTitle, comments: []});
      book.save();
      res.json(book);

    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      let booksRemoved = await libraryModel.deleteMany();
      console.log(booksRemoved);
      if (booksRemoved.acknowledged) {
        res.send('complete delete successful')
      } 
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      
      if (!mongoose.isValidObjectId(bookid)) {
        res.send('no book exists')
        return
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      await libraryModel.findById(bookid).exec().then((item) => {
        console.log(item, 'get one' )

        if (!item) {
          res.send('no book exists')
          return
        }
        res.json({
          _id: item._id,
          title: item.title,
          comments: item.comments
        })
      })

    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!mongoose.isValidObjectId(bookid)) {
        res.send('no book exists')
        return
      }


      if (!comment) {
        res.send('missing required field comment')
      } else {
        let bookUpdate = await libraryModel.findById(bookid)
        console.log(bookUpdate)
        if (!bookUpdate) {
          res.send('no book exists')
        } else {
           bookUpdate.comments.push(comment)
           bookUpdate.save();
           res.json({_id: bookUpdate._id, title: bookUpdate.title, comments: bookUpdate.comments})
        }
      }

    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!mongoose.isValidObjectId(bookid)) {
        res.send('no book exists')
        return
      }

      libraryModel.deleteOne({_id: bookid}).then((reply) => {
        console.log(reply)
        if (reply.deletedCount == 0) {
          res.send('no book exists')
        } else {
          res.send('delete successful')
        } 
      })
    });
  
};
