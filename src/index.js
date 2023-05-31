const dirNames = [
  "ひらがな",
  "カタカナ",
  "小1",
  "小2",
  "小3",
  "小4",
  "小5",
  "小6",
  "中2",
  "中3",
  "常用",
  "常用外",
];

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function changeGrade(event) {
  const dir = dirNames[event.target.selectedIndex];
  location.href = `/graded-vocab-ja/${dir}/`;
}

loadConfig();
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("gradeOption").onchange = changeGrade;
