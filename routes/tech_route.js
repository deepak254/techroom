/**
 * 
 */
/**
 * 
 */
// This File Contains all Route Handling related Stuff:: Deepak Tiwari
 var app=require('../app');
 var express = require('express');
 var flash = require('connect-flash');
 var router=express.Router();
 exports.router=router;
 var bodyParser=require('body-parser');
 var  passport = require('passport');
 var LocalStrategy = require('passport-local');
 var bCrypt = require('bcrypt-nodejs'); 
 var mongoose = require('mongoose');
 var socketio = require('socket.io');
 var url = require('url');
 var queryString = require( "querystring" );

 var loggedInMember="";
 var currentRoom="";
 var allrooms=[];
 var roomQuestions=[];
//express().use(bodyParser.urlencoded());
express().use(bodyParser.json());



var mytechroom=require('../model/techroom_model');
//var tech_roomSchema=require('../model/tech_room');
 
var db = mytechroom.db;

db.on('error',function(msg){
		console.log(msg);
});
db.once('open',function(msg){
		console.log('connection succeeded');
});

//router.use(flash()); 

function getRooms(){
	
	 mytechroom.rooms.find({}, function(err,rooms){
	      if(err){res.send("error");}
	      return rooms;
	  });
	
	
}

router.get('/flash', function(req, res){
	  // Set a flash message by passing the key, followed by the value, to req.flash().
	 // req.flash('info', 'Flash is back!');
	 // next();
	 res.redirect('/');
	});


// #1
 router.get('/', function(req,res){
	 
mytechroom.rooms.find({}, function(err,rooms){
	      if(err){res.send("error");}
	      allrooms= rooms;
	  });
	  res.render('index',{rooms:allrooms});
 
 
 });//req,res


//#2
router.get('/upload', function(req,res){
		
		res.render('./resources/uploadQA',{title:'myroom',expressFlash: req.flash('info')});
});


//#3
router.get('/getContact', function(req,res){
			
			res.render('contact_us');
	});
 
 
 router.get('/getlogin', function(req,res){
		
		res.render('login');
	});


 router.get('/store',function(req,res){
		
		res.render('./resources/store_room');
});

 
 
 
 
 router.get('/store_room',function(req,res){
	 
	 var room=req.body.room.name
	 mytechroom.storeTechRoom(room);
	 res.end('room with name '+room_name+ ' saved...');   	
});
 
 
 
//#2
 router.get('/chatroom', function(req,res){
 		
 		res.render('./resources/chat_room');
 });
//#2
 router.get('/QA', function(req,res){
//	 
//	   mytechroom.rooms.findOne({room_name:'Java'}, function(err,room){
//	      if(err){res.send("error");}
//	      currentRoom=room;
//	      res.render('./resources/tech_QA',{room:currentRoom});
//	    });
	   res.render('./resources/tech_QA',{room:currentRoom,roomquestions:questions});
	   //console.log(currentRoom);
 		
 });
 
 router.get('/table', function(req,res){
	 mytechroom.rooms.findOne({room_name:'Java'}, function(err,room){
	      if(err){res.send("error");}
	      roomQuestions=room.room_questions;
	     res.render('./resources/all_questions',{questions:room.room_questions});
	  });
		
});
//#2
 
 
 router.get('/getdata',function(req,res){
	 
	 
	 mytechroom.rooms.findOne({ room_name : 'Java' },function(err,room){
		  if(err){throw err;}
		 res.send(room.room_questions);
		 
		 
	 });
 });
 
 
 router.get('/:id/like',function(req,res){
	 
	 var html="<html><body>"+req.params.id+" liked </body></html>"
	 
	//console.log(req.params.id + ' Q liked ') 
	 res.writeHeader(200, {"Content-Type": "text/html"});  
     res.write(html);  
     res.end();  
	//res.send(req.params.id);
 });
 
 
 //Route that handle ajax request for Questions search based on emails 
 router.get('/searching', function(req,res){
	
	
	var questions_based_on_email=[];
	 //console.log(req.url);
	 var theUrl = url.parse( req.url);
	  //console.log(theUrl);
     // gets the query part of the URL and parses it creating an object
     var queryObj = queryString.parse(theUrl.query);
     //console.log(queryObj);
	 var searchCriteria = JSON.parse(queryObj.jsonData);
	// console.log(obj);
	 console.log(searchCriteria.query);
	 console.log(searchCriteria.criteria);
	
if(searchCriteria.criteria.localeCompare('email') === 0){	 
	 
	 for(var i=0;i<currentRoom.room_questions.length;i++){
		 
		 if(searchCriteria.query.localeCompare(currentRoom.room_questions[i].question_from_email) === 0){
			 questions_based_on_email.push(currentRoom.room_questions[i]);
		    }
		 }
    }//if ends
  else{
	
	for(var i=0;i<currentRoom.room_questions.length;i++){
		
		if(currentRoom.room_questions[i].question_tags.indexOf(searchCriteria.query) > 0){
			console.log(currentRoom.room_questions[i].question_tags);	
			  questions_based_on_email.push(currentRoom.room_questions[i]);
		}
			
	}//loop
}//else ends
	
// console.log(questions_based_on_email);  
	 // res.send(room.room_questions);
	  
     
    res.send(questions_based_on_email);
	
});
 
 
 /*
  ********************************* DATABASE ROUTE HANDLING ******************************************
  * */

 
 router.post('/upload_question',function(req,res){
	 

	    //debugger;
	   // myroom.checkThisRoom(req,res);
	   //req.flash('info', 'user already there Dude !!');
	  mytechroom.rooms.findOne({'room_name':req.body.ques.room}, function(err,room){
		      if(err){res.send("error");}
		      	    if(room === null) {
		      	    					console.log('Room not found');
		      	  		 		 		 req.flash('info', 'Oops!! Room not found !!');
		      	  		  				 res.redirect('/upload');
		      	  		  	 }  
		      	  
		       else{
		    	   
		    	      room.room_questions.push(
		   				{
		   					
		   					  question_from_email:req.body.ques.email,
	        	              question_content:req.body.ques.question,
	        	              question_type:'interview',
	        	              question_tags:req.body.ques.tags,
	        			      question_sentDate:Date.now(),
	        			      question_answer_owner:{
	        			    	  answer_content:req.body.ques.answer,
	        			    	  answer_rating: 0
	        			      }
	        			      
	        			
		   		   });
		   		 
		   		room.save(function(err){
		   			 
		   			 if(err){throw err;}
		   			 
		   		 });
		   		 req.flash('info', 'Question Uploaded Successfully.Upload More.');
	   			 //res.redirect('/upload');  
	   			 res.redirect('back');
		       }				
		    });
		
}); //upload_question route end
 

 
 router.get('/:id/getQA',function(req,res){
	 
	 mytechroom.rooms.findOne({ '_id' : req.params.id },function(err,room){
		  if(err){throw err;}
		  currentRoom=room;
		  questions=room.room_questions
		  //int len=room.room_questions.length;
	      res.redirect('/QA');
		 
		 
	 });
	 
 });
 
 
 
 
 /*
  ********************************* DATABASE ROUTE HANDLING ******************************************
  *
  *
  *
  *
  *
  * */
 
 
 