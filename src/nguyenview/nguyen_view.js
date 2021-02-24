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

//function getTotalUsers() {
//}

function getNames() {
    let users = [];
    db.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            users.push(doc.id);
        });
    });
    return users
}

//function getID() {
//}

//function getPeriod() {
//}



//adds total number of rows according to number of students
function addRow(name) {	
	var table = document.getElementById("table");
	var row = table.insertRow(1);
	var name_row = row.insertCell(0);
  	var id_row = row.insertCell(1);
  	var period_row = row.insertCell(2);

  	name_row.innerHTML = name;
  	id_row.innerHTML = "getID()";
  	period_row.innerHTML = "getPeriod()";
}

const names = getNames()
console.log(names)
console.log(names.length)
for (i=0; i<names.length; i++) {
    addRow(names[i]);
    console.log(names[i])
}