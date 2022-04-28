var socket = io();


var formatTime = function(t){
	t = parseInt(t)
	if(t<60){
		return "1 min";
	}else{
		return Math.floor(t/60)+" min";
	}
};

socket.on("connection", () => {
	console.log(socket.connected);
});
socket.on("send all data", (log) => {
	console.log("log was recieved");
	console.log(log);
	var tableEl = document.getElementById("all-data-rows-container");
	var container = document.getElementById("all-data-container");
	var row;
	tableEl.innerHTML = ""; // clear old data
	for(var i=0; i<log.length; i++){
		row = document.createElement("tr");
		var d = document.createElement("td");
		var date = new Date(1000*parseInt(log[i].time_in))
		d.innerHTML = date.toUTCString();
		var s = document.createElement("td");
		s.innerHTML = log[i].student_ID;
		var t = document.createElement("td");
		t.innerHTML = formatTime(log[i].duration);
		row.appendChild(d);
		row.appendChild(s);
		row.appendChild(t);
		tableEl.appendChild(row);
	}
	container.style.display = "block";
});
socket.on("send student data", (rows) => {
	console.log("recieved student data");
	var tableEl = document.getElementById("student-row-container");
	var sumEl = document.getElementById("sum");
	var container = document.getElementById("student-stats-container");
	var row;
	var total = 0;
	tableEl.innerHTML = ""; // clear old data
	for(var i=0; i<rows.length; i++){
		row = document.createElement("tr");
		var d = document.createElement("td");
		var date = new Date(1000*parseInt(rows[i].time_in))
		d.innerHTML = date.toUTCString();
		var t = document.createElement("td");
		t.innerHTML = formatTime(rows[i].duration);
		total+=parseInt(rows[i].duration);
		row.appendChild(d);
		row.appendChild(t);
		tableEl.appendChild(row);
	}
	sumEl.innerText = "total time: "+formatTime(total);
	container.style.display = "block";
});


var testButt = document.getElementById("get_all_data");
var indivButt = document.getElementById("get individual");

testButt.addEventListener("click", function(e){
	console.log("click");
	socket.emit('get all data');
	console.log("requested data");
});
indivButt.addEventListener("click", function(e){
	console.log("getting student's data");
	var i = document.getElementById("id_num").value;
	if(i){
		socket.emit("get student data", i);
	}else{
		alert("no records found");
	}
});

