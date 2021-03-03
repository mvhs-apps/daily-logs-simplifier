import { sanitize } from "dompurify";
import marked from "marked";
import enableTabs from "~/tab";
import axios from "axios";
// import "~/gapi";
// import gapi from "gapi";

const sheetId = "1KlJr8TqIwTsxcUU0GXHzm8v2e5JSdM_8RrttYy5hYtA";
const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/1/public/values?alt=json`;
console.log(url);

const parent = document.querySelector("#parent");

const IEntry = { title: "", prompt: "" };

// Keeps track of how many times the script failed to update a document
let updatesFailed = 0;

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
  console.log("data");
  console.log(data);
  console.log(data.feed);
  console.log(data.feed.entry);
  const [topic, ...entries] = [...data.feed.entry];

  console.log(entries);

  entryCache = entries.map(e => ({
    title: sanitize(e.gsx$section.$t),
    prompt: marked(sanitize(e.gsx$content.$t))
  }));

  topicCache = topic.gsx$content.$t;

  console.log(entryCache);
  console.log(topicCache);

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

  console.log("entries");
  console.log(entries);
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
 * @param {HTMLButtonElement} btn
 * @param {string?} docId
 */
window.create = async (btn, docId) => {
  /**
   * @type {string}
   */
  let documentId;

  try {
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

    /**
     * @type {string}
     */
    const folderId = await (async () => {
      const res = await gapi.client.drive.files.list({
        q: "name = 'APCS' and mimeType = 'application/vnd.google-apps.folder'"
      });

      if (res.result.files.length) return res.result.files[0].id;

      const newFolderRes = await gapi.client.drive.files.create({
        mimeType: "application/vnd.google-apps.folder",
        name: "APCS"
      });

      return newFolderRes.result.id;
    })();

    documentId = await (async () => {
      if (docId) return docId;

      /* const res = await gapi.client.drive.files.list({
        q: `name = '${topic}' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents`
      });

      if (res.result.files.length) return res.result.files[0].id; */

      const newDocRes = await gapi.client.drive.files.create({
        mimeType: "application/vnd.google-apps.document",
        name: topic,
        parents: [folderId]
      });

      return newDocRes.result.id;
    })();

    btn.innerText = "Updating...";

    const text = `${topic}\n\n${answers
      .map(answer => `${answer.title}:\n${answer.value}`)
      .join("\n\n")}`;

    await gapi.client.docs.documents.batchUpdate(
      { documentId },
      {
        requests: [
          {
            insertText: {
              text,
              location: {
                index: 1,
                segmentId: ""
              }
            }
          }
        ]
      }
    );

    await gapi.client.docs.documents.batchUpdate(
      { documentId },
      {
        requests: [
          {
            updateParagraphStyle: {
              range: {
                startIndex: 1,
                endIndex: topic.length
              },
              paragraphStyle: {
                namedStyleType: "HEADING_1"
              },
              fields: "namedStyleType"
            }
          },
          ...answers.map(answer => ({
            updateParagraphStyle: {
              range: {
                startIndex: text.indexOf(answer.title),
                endIndex: text.indexOf(answer.title) + answer.title.length
              },
              paragraphStyle: {
                namedStyleType: "HEADING_2"
              },
              fields: "namedStyleType"
            }
          })),
          ...answers.map(answer => ({
            updateTextStyle: {
              range: {
                startIndex:
                  text.indexOf(answer.title) + answer.title.length + 2,
                endIndex:
                  text.indexOf(answer.title) +
                  answer.title.length +
                  answer.value.length +
                  3
              },
              textStyle: {
                weightedFontFamily: {
                  fontFamily: "Source Code Pro"
                }
              },
              fields: "weightedFontFamily"
            }
          }))
        ]
      }
    );

    btn.innerText = "Created!";
  } catch (err) {
    if (updatesFailed >= 5) {
      updatesFailed = 0;
      btn.innerText = "Try again :(";
      throw err;
    }

    updatesFailed++;
    console.error(err);
    create(btn, documentId);
  }
};

window.signIn = () => gapi.auth2.getAuthInstance().signIn();
window.signOut = () => gapi.auth2.getAuthInstance().signOut();

// window.setTimeout(function() {
//   init();
// }, 1000);
gapi.load("client:auth2", init);

function init() {
  console.log("init called");
  gapi.load("auth2", async function() {
    await gapi.client
      .init({
        apiKey: "AIzaSyADwwNFoJFdhY53K8vsJQKNHTCxGwsiiHU",
        clientId:
          "438020323125-jpjei4hnp58fi80sqseg70frdjdil51h.apps.googleusercontent.com",
        discoveryDocs: [
          "https://docs.googleapis.com/$discovery/rest?version=v1",
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        ],
        scope: "https://www.googleapis.com/auth/drive.file"
      })
      .then(function() {
        console.log("success in init");
      })
      .catch(function() {
        console.log("failed to init");
      });
    // await gapi.auth2.init();
    // console.log("gapi auth 2 initialized");
  });
}

// // await
// gapi.client.init({
//   apiKey: "AIzaSyADwwNFoJFdhY53K8vsJQKNHTCxGwsiiHU",
//   clientId:
//     "438020323125-jpjei4hnp58fi80sqseg70frdjdil51h.apps.googleusercontent.com",
//   discoveryDocs: [
//     "https://docs.googleapis.com/$discovery/rest?version=v1",
//     "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
//   ],
//   scope: "https://www.googleapis.com/auth/drive.file"
// });
// // gapi.load("client:auth2", async () => {
// // });

start();

/**
 * @param {HTMLInputElement} el
 */
window.switchTheme = el => {
  let lightElement = document.querySelector("#light-style");
  let darkElement = document.querySelector("#dark-style");

  if (el.checked) {
    lightElement.rel = "stylesheet";
    darkElement.rel = "stylesheet alternate";
  } else {
    lightElement.rel = "stylesheet alternate";
    darkElement.rel = "stylesheet";
  }
};
