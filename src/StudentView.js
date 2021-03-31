var firebaseConfig = {
	apiKey: "AIzaSyADwwNFoJFdhY53K8vsJQKNHTCxGwsiiHU",
	authDomain: "daily-log-creator.firebaseapp.com",
	databaseURL: "https://daily-log-creator.firebaseio.com",
	projectId: "daily-log-creator",
	storageBucket: "daily-log-creator.appspot.com",
	messagingSenderId: "438020323125",
	appId: "1:438020323125:web:2c78e3f40c689c1d6f3e7c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const getLogs = () => {
	var USERID = "LaByzX9pUOAu56QD8eD4"; //placeholder
	const docRef = db.collection("users").doc(USERID);
	
	docRef.get().then(function(doc) {
		if(doc.exists) {
			// console.log(doc.data().name);
			document.getElementById("name").innerHTML = "Name: " + doc.data().name;
		} else {
			console.log("doc does not exist");
		}
	}).catch(function(error) {
		console.log("error:",error);
	});
	
	var table = document.getElementById("logsTable");
	docRef.collection("logs").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			var row = table.insertRow();
			var c1 = row.insertCell();
			var c2 = row.insertCell();
			var c3 = row.insertCell();
			c1.innerHTML = doc.id;
			c2.innerHTML = doc.data().link;
			c3.innerHTML = doc.data().completed;
		});
	});
	// console.log(docRef.collection("logs"));
}

getLogs();