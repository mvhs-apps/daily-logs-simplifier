import { sanitize } from "dompurify";
import marked from "marked";
import enableTabs from "~/tab";
import axios from "axios";
import "~/gapi";

const sheetId = "1k9WZcsauAp6LI7T_eIzQ_tr2WgWo86pYUMTtkl0CH3c";
const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/1/public/values?alt=json`;

const parent = document.querySelector("#parent");

const IEntry = { title: "", prompt: "" };

/**
 * @type {IEntry[]}
 */
let entryCache;

/**
 * @type {string}
 */
let topicCache;

async function getData() {
  if (entryCache && topicCache) {
    return {
      entries: entryCache,
      topic: topicCache
    };
  }

  const { data } = await axios.get(url);
  if (!data) {
    return {
      entries: [],
      topic: ""
    };
  }

  const [topic, ...entries] = [...data.feed.entry];

  entryCache = entries.map(e => ({
    title: sanitize(e.gsx$title.$t),
    prompt: marked(sanitize(e.gsx$prompt.$t))
  }));

  topicCache = topic.gsx$prompt.$t;

  return {
    entries: entryCache,
    topic: topicCache
  };
}

async function start() {
  if (!parent) return;

  const { topic, entries } = await getData();

  if (!entries.length) return;

  const topicEl = document.createElement("h2");
  topicEl.textContent = topic;
  parent.appendChild(topicEl);

  entries.forEach(e => {
    const el = document.createElement("div");

    const newTitle = e.title.startsWith("!") ? e.title.slice(1) : e.title;

    el.className = "row mb-4";
    el.id = `prompt-${entries.indexOf(e)}`;

    el.innerHTML = `
    <div class="col-sm allboxes">
      <h3>${newTitle}</h3>
      <p>${e.prompt}</p>
    </div>`;

    if (e.title.startsWith("!")) {
      el.innerHTML = `
      <div class="justtext allboxes">
        <h3>${newTitle}</h3>
        <p>${e.prompt}</p>
      </div>`;
    }

    if (!e.title.startsWith("!")) {
      el.innerHTML += `
      <div class="textar allboxes">
        <textarea rows="10"></textarea>
      </div>`;
    }

    parent.appendChild(el);
  });

  enableTabs();
}

/**
 * @type {(btn: HTMLButtonElement) => void}
 */
window.create = async btn => {
  const { topic, entries } = await getData();

  const answers = entries
    .filter(e => !e.title.startsWith("!"))
    .map(e => {
      /**
       * @type {HTMLTextAreaElement}
       */
      const textarea = document.querySelector(
        `#prompt-${entries.indexOf(e)} textarea`
      );

      if (!textarea) {
        return {
          value: `Element not found: ${entries.indexOf(e)}`,
          title: e.title
        };
      }

      return { value: textarea.value, title: e.title };
    });

  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    return signIn();
  }

  btn.innerText = "Creating...";

  const date = new Date().toLocaleDateString();
  let folderId;
  let response = null;
  
  try {
    response = await gapi.client.drive.files.list({
      "q": "name = 'APCS' and mimeType = 'application/vnd.google-apps.folder'"
    });
  } catch (err) {
    console.error("Execute error", err);
    return;
  }
  console.log("Response", response);
  if (response.result.files.length != 0) {
    folderId = response.result.files[0].id;
  } else {
    let response1 = null;
    try {
      response1 = await gapi.client.drive.files.create({
        "mimeType": "application/vnd.google-apps.folder",
        "name": "APCS"
      });
    } catch (err) {
      console.error("Execute error", err);
      return;
    }
    folderId = response1.result.id;
  }
  
  const searchQuery = "name = '" + topic + "' and mimeType = 'application/vnd.google-apps.document' and '" + folderId + "' in parents";
  response = null;
  try {
    response = await gapi.client.drive.files.list({
      "q": searchQuery
    });
  } catch (err) {
    console.error("Execute error", err);
    return;
  }
  let documentId;
  if (response.result.files.length != 0) {
    documentId = response.result.files[0].id;
  } else {
    response = null;
    try {
      response = await gapi.client.drive.files.create({
        "mimeType": "application/vnd.google-apps.document",
        "name": `${topic}`,
        "parents": [
          folderId
        ]
      });
    } catch (err) {
      console.error("Execute error", err);
      return;
    }
    documentId = response.result.id;
  }

  try {
    console.log("1");
    console.log(topic);
    console.log("2");
    console.log(entries);
    console.log("3");
    console.log(answers);
    console.log("4");
    console.log(answers.title);
    console.log("5");
    console.log(answers.value);
  } catch (error) {
    console.log("oof");
  }

  const req = {
    requests: [
      {
        insertText: {
          text: `# ${topic}\n\n${answers
            .map(answer => `### ${answer.title}:\n\n${answer.value}`)
            .join("\n\n")}`,
          location: {
            index: 1,
            segmentId: ""
          }
        }
      }
    ]
  };

  btn.innerText = "Updating...";
  
  try {
    await gapi.client.docs.documents.batchUpdate(
      { documentId: documentId },
      req
    );
  } catch (err) {
    console.error("Execute error", err);
	btn.innerText = "Try again :(";
    return;
  }
  
  btn.innerText = "Created!";
};

window.signIn = () => gapi.auth2.getAuthInstance().signIn();
window.signOut = () => gapi.auth2.getAuthInstance().signOut();

gapi.load("client:auth2", async () => {
  await gapi.client.init({
    apiKey: "AIzaSyADwwNFoJFdhY53K8vsJQKNHTCxGwsiiHU",
    clientId:
      "438020323125-jpjei4hnp58fi80sqseg70frdjdil51h.apps.googleusercontent.com",
    discoveryDocs: ["https://docs.googleapis.com/$discovery/rest?version=v1", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    scope: "https://www.googleapis.com/auth/drive.file"
  });
});

start();
