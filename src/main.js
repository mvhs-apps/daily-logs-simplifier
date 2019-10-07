import "bootstrap/dist/css/bootstrap.min.css";
import "~/styles";

import { sanitize } from "dompurify";
import marked from "marked";
import enableTabs from "~/tab";

const sheetId = "1k9WZcsauAp6LI7T_eIzQ_tr2WgWo86pYUMTtkl0CH3c"; // this is the id of the spreadsheet
const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;

const parent = document.querySelector("#parent"); // get element with id "parent"

// either "dark" or "light"
const theme = "dark";

// set theme
document.body.classList.add(`theme-${theme}`);

const navbar = document.querySelector(".navbar");

if (navbar) {
  navbar.classList.add(`navbar-${theme}`, `bg-${theme}`);
}

let entries = [];

async function getData() {
  const data = await fetch(url).then(d => d.json()); // send GET request to fetch data
  if (!data) return []; // return empty array if no data

  entries = [...data.feed.entry].map(e => ({
    title: e.gsx$title.$t,
    prompt: marked(sanitize(e.gsx$prompt.$t))
  }));

  return entries;
}

async function start() {
  if (!parent) return; // return if can't find divs

  await getData();

  if (!entries.length) {
    return;
  }

  entries.forEach(e => {
    const el = document.createElement("div");
    el.className = "row mb-4";
    el.id = `prompt-${entries.indexOf(e)}`;
    el.innerHTML = `<div class="col-sm">
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

window.create = () => {
  const answers = entries.map(e => {
    const textarea = document.querySelector(
      `#prompt-${entries.indexOf(e)} textarea`
    );

    if (!textarea) return;

    return textarea.value;
  });

  console.log(answers);
};

start();
