const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const mariadb = require('mariadb');
const pool = { //mariadb.createPool({
	host: 'localhost',
	user: 'owen',
	password: 'password',
	database: 'TimeTracker'
	//connectTimeout: 100
};


//module.exports = Object.freeze({
// 	pool: pool
//});
//console.log(pool.totalConnections());

async function asyncFunction() {
	let conn;
	try {
		conn = await mariadb.createConnection(pool); //pool.getConnection();
		//var result = await conn.query("CREATE TABLE "+name+" (id int AUTO_INCREMENT PRIMARY KEY, student_ID INT);");
		console.log("connected to mariadb");
	} catch (err) {
		throw err;
	} finally {
		if (conn) return conn.end();
	}
};
async function makeClass(name) {
	let conn;
	try {
		conn = await mariadb.createConnection(pool) //pool.getConnection();
			.then(conn => {
				conn.query("INSERT INTO classes (name, teacher_ID) VALUES ('"+name+"', 88);")  // "CREATE TABLE "+name+" (id INT AUTO_INCREMENT PRIMARY KEY, student_ID INT);")
				.then(result => {
					console.log(result);
				});
				return conn;
			})
			.then(conn => {
				conn.query("CREATE TABLE "+name+"_students (id INT AUTO_INCREMENT PRIMARY KEY, student_ID INT);")
				.then(result => {
					console.log(result);
				});
			});
		//console.log("result");
	} catch (err) {
		throw err;
	} finally {
		if (conn) return conn.end();
	}
};
async function get_log() {
	let conn;
	let rows;
	try {
		conn = await mariadb.createConnection(pool);
		rows = await conn.query("SELECT * FROM times;");
		//console.log(rows[0]);
	} catch (err) {
		throw err;
	} finally {
		conn.end();
		return rows;
	}
};
async function get_student(id_num) {
	//console.log("func");
	let conn;
	let rows;
	try {
		conn = await mariadb.createConnection(pool);
		//console.log(id_num);
		rows = await conn.query("SELECT * FROM times WHERE student_ID="+id_num+";");
		//console.log(rows);
	} catch (err) {
		throw err;
	} finally {
		if (conn) conn.end();
		return rows;
	}
};

asyncFunction(); //test connetion to maria

app.get('/', function(req, res) {
	//res.send('Hello World');
	res.sendFile("/home/pi/nodejs_projects/TimeTracker/site.html");
});
app.get('/teacher_center.html', function(req, res) {
	//res.send('Hello World');
	res.sendFile("/home/pi/nodejs_projects/TimeTracker/teacher_center.html");
});
app.get('/teacher_center.js', function(req, res) {
	//res.send('Hello World');
	res.sendFile("/home/pi/nodejs_projects/TimeTracker/teacher_center.js");
});
app.get('/script.js', function(req, res) {
	res.sendFile("/home/pi/nodejs_projects/TimeTracker/script.js");
});
app.get('/style.css', function(req, res) {
	res.sendFile("/home/pi/nodejs_projects/TimeTracker/style.css");
});
app.get('/socket.io/socket.io.js', function(req, res){
	res.sendFile(__dirname+"/node_modules/socket.io/client-dist/socket.io.js");
});


/*io.use((socket, next) => {
	const sessionID = socket.handshake.auth.sessionID;
	if (sessionID) {
		const session = sessionStore.findSession(sessionID);
		if(session) {
			socket.sessionID = sessionID;
			socket.userID = session.userID;
			socket.username = session.username;
			return next();
		}
	}
	const username = socket.handshake.auth.username;
	if(!username){
		return next(new Error("invalid username"));
	}
	//create new session
	socket.sessionID = randomID();
	socker.userID = randomID();
	socket.username = username;
	next();
});*/
io.on("connection", (socket) => {
	console.log('a user connected');
	//var newUserID = getUserID();

	//socket.emit("session", newUserID);

	socket.on("disconnection", () => {
		console.log('a user disconnected');
	});
	socket.on("new class", (name) => {
		console.log("new class request recieved: "+name);
		makeClass(name);
	});
	socket.on("get all data", () => {
		console.log("all data requested");
		get_log().then((r) => {
			//console.log(r);
			io.emit("send all data", r);
		});
	});
	socket.on("get student data", (id_num) => {
		console.log("student data req");
		get_student(id_num).then((rows) => {
			io.emit("send student data", rows);
		});
	});
});

var userIDs = []; //max of 50 people connected
var getNewID = function(){
	if(userIDs.length>49){
		console.log("too moany users conected");
	}else{
		var n = Math.floor(Math.random()*50);
		while(n in userIDs){
			n = Math.floor(Math.random()*50);
		}
		return n;
	}
};

server.listen(3001, () => {
	console.log("listening on *:3001");
});
/*
var server = app.listen(8081, function() {
	var host = server.address().address;
	console.log("example app on %s", host);
});
*/
