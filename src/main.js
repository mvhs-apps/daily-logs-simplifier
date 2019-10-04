import "bootstrap/dist/css/bootstrap.min.css";
import "~/styles/main.scss";

import { sanitize } from "dompurify";
import marked from "marked";
import "~/tab";

const sheetId = "1k9WZcsauAp6LI7T_eIzQ_tr2WgWo86pYUMTtkl0CH3c"; // this is the id of the spreadsheet
const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;

const directions = document.querySelector("#directions"); // get div element with id "directions"
const questions = document.querySelector("#questions"); // get div element with id "questions"

// either "dark" or "light"
const theme = "dark";

// set theme
document.body.classList.add(`theme-${theme}`);

const navbar = document.querySelector(".navbar");

if (navbar) {
  navbar.classList.add(`navbar-${theme}`, `bg-${theme}`);
}

async function getData() {
  const data = await fetch(url).then(d => d.json()); // send GET request to fetch data
  if (!data) return []; // return empty array if no data

  const logs = [...data.feed.entry]
    .map(e => ({
      date: new Date(e.gsx$date.$t),
      directions: marked(sanitize(e.gsx$directions.$t)),
      questions: String(e.gsx$questions.$t).split("\n")
    })) // gather data from sheet and arrange into interface
    .sort((a, b) => b.date - a.date); // sort by date (newest first)

  return logs;
}

async function start() {
  if (!directions || !questions) return []; // return if can't find divs

  const logs = await getData();

  const log =
    logs.filter(l => l.date.toDateString() === new Date().toDateString())[0] ||
    logs[0]; // get the log for today (and if it doesn't exist, get the most recent log)

  if (!log) {
    directions.innerHTML = "No directions available today";
    questions.innerHTML = "No questions available today";
    return;
  }

  directions.innerHTML = log.directions; // show directions

  questions.innerHTML = `
  <ol>
  ${log.questions.map(q => `<li>${q}</li>`).join("\n")}
  </ol>`; // show questions
}

start();
