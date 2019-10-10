import "bootstrap/dist/css/bootstrap.min.css";
import "~/styles";

import { sanitize } from "dompurify";
import marked from "marked";
import enableTabs from "~/tab";
import axios from "axios";

const sheetId = "1k9WZcsauAp6LI7T_eIzQ_tr2WgWo86pYUMTtkl0CH3c";
const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;

const parent = document.querySelector("#parent");

const theme = "dark";

document.body.classList.add(`theme-${theme}`);

const navbar = document.querySelector(".navbar");

if (navbar) {
  navbar.classList.add(`navbar-${theme}`, `bg-${theme}`);
}

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
        class="form-control textarea"
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

    if (!textarea) return `Element not found: ${entries.indexOf(e)}`;

    return textarea.value;
  });

  console.log(answers);
};

start();
