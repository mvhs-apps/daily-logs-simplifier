/* Including this allows the user to use <tab> in textareas */

const elements = document.querySelectorAll("textarea");

elements.forEach(el =>
  el.addEventListener(
    "keydown",
    function(e) {
      if (e.keyCode === 9) {
        // tab was pressed
        // get caret position/selection
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var target = e.target;
        var value = target.value;

        // set textarea value to: text before caret + tab + text after caret
        target.value = value.substring(0, start) + "  " + value.substring(end);

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 2;

        // prevent the focus lose
        e.preventDefault();
      }
    },
    false
  )
);
