import "~/styles";

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

async function getData() {
  if (entryCache) return entryCache;

  const { data } = await axios.get(url);
  if (!data) return [];

  entryCache = [...data.feed.entry].map(e => ({
    title: sanitize(e.gsx$title.$t),
    prompt: marked(sanitize(e.gsx$prompt.$t))
  }));

  return entryCache;
}

async function start() {
  if (!parent) return;

  const entries = await getData();

  if (!entries.length) return;

  entries.forEach(e => {
    const el = document.createElement("div");

    el.className = "row mb-4";
    el.id = `prompt-${entries.indexOf(e)}`;

    el.innerHTML = `
    <div class="col-sm">
      <h3>${e.title}</h3>
      <p>${e.prompt}</p>
    </div>
    <div class="col-sm">
      <textarea
        rows="10"
      ></textarea>
    </div>`;

    parent.appendChild(el);
  });

  enableTabs();
}

window.create = async () => {
  const entries = await getData();

  const answers = entries.map(e => {
    /**
     * @type {HTMLTextAreaElement | null}
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
    console.log("i found it");
  } else {
    console.log("i didnt find it");
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
  
  const title = `Daily Log - ${date}`;
  const searchQuery = "name = '" + title + "' and mimeType = 'application/vnd.google-apps.document' and '" + folderId + "' in parents";
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
    console.log("i found it");
  } else {
    response = null;
    console.log("i didnt find it");
    try {
      response = await gapi.client.drive.files.create({
        "mimeType": "application/vnd.google-apps.document",
        "name": title,
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
  const req = {
    requests: [
      {
        insertText: {
          text: answers
            .map(answer => `### ${answer.title}:\n\n${answer.value}`)
            .join("\n\n"),
          location: {
            index: 1,
            segmentId: ""
          }
        }
      }
    ]
  };

  await gapi.client.docs.documents.batchUpdate(
    { documentId: documentId },
    req
  );
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
