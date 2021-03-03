function getCompletionByDate(completion, day, name, user_data) {
    completion.doc(day).get().then((doc) => {
        if (doc.exists) {
            console.log(`${name}'s doc data:`, user_data);
            console.log(`${name}'s completion:`, doc.data());
            console.log('\n');
            dict[name] = doc.data();
        } else {
            console.log(`No such doc: ${name}/logs/${day}`);
            console.log('\n');
        }
    })
}

function getAllCompletion(completion, name, user_data) {
    completion.get().then((querySnapshot) => {
        console.log(`${name}'s doc data:`, user_data);
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                console.log(`${name}'s completion for ${doc.id}:`, doc.data());
                dict[name] = doc.data();
            }
        });
        console.log('\n');
    })
}

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
const db = firebase.firestore();

const getAll = true;
const day = "12-20";
let dict = {};

db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let users = db.collection("users").doc(doc.id);
        users.get().then((doc) => {
            let name = doc.id;
            let user_data = doc.data()
            let completion = users.collection("logs");

            if(getAll) {
                getAllCompletion(completion, name, user_data);
            } else {
                getCompletionByDate(completion, day, name, user_data);
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    });
});
console.log(dict);