
const config = {
    apiKey: "AIzaSyADwwNFoJFdhY53K8vsJQKNHTCxGwsiiHU",
    authDomain: "daily-log-creator.firebaseapp.com",
    databaseURL: "https://daily-log-creator.firebaseio.com",
    projectId: "daily-log-creator",
    storageBucket: "daily-log-creator.appspot.com",
    messagingSenderId: "438020323125",
    appId: "1:438020323125:web:2c78e3f40c689c1d6f3e7c"
};



firebase.initializeApp(config);
let db = firebase.firestore();
let users = [];


db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id}`);
        users.push(doc.id);
    });
});

console.log(users);



//function getTotalUsers() {

//}

//function getName() {

//}

//function getID() {

//}

//function getPeriod() {

//}



//adds total number of rows according to number of students
function addRows() {
	var user0 = users[0]; //is currently undefined
	
	var table = document.getElementById("table");
	var row = table.insertRow(1);
	var cell1 = row.insertCell(0);
  	var cell2 = row.insertCell(1);
  	var cell3 = row.insertCell(2);
  	cell1.innerHTML = "getName()";
  	cell2.innerHTML = "getID()";
  	cell3.innerHTML = "getPeriod()";
}


addRows();