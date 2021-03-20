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
const users = db.collection("users")

async function getDict() {
    let dict = {};
    await users.get().then(querySnapshot => {
        querySnapshot.forEach(doc => dict[doc.id] = doc.data());
    });
    return dict
}

function addRow(value) {
	var table = document.getElementById("table");
	var row = table.insertRow(1);
	var name_col = row.insertCell(0);
  	var id_col = row.insertCell(1);
  	var period_col = row.insertCell(2);

  	name_col.innerHTML = value[0]["name"];
  	id_col.innerHTML = value[0]["email"];
  	period_col.innerHTML = value[0]["period"];
}

async function initialize() {
    const user_dict = await getDict();
    const name_dict = {};
    const names = [];

    for (const [key, value] of Object.entries(user_dict)) {
        name_dict[value["name"]] = [value];
        names.push(value["name"]);
    } names.reverse();

    for (let i=0; i<names.length; i++) {
        console.log(names[i])
        addRow(name_dict[names[i]]);
    }
}
initialize();