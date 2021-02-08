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