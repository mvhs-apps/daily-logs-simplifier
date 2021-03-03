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
	var USERID = "placeholder";
	var logs = db.collection(USERID).ref().('users/' + USERID).orderByChild('date');
}

//unfinished!
