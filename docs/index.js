const dirNames=["ひらがな","カタカナ","小1","小2","小3","小4","小5","小6","中2","中3","常用","常用外"];function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function changeGrade(){const a=dirNames[this.selectedIndex];location.href=`/graded-vocab-ja/${a}/`}loadConfig(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("gradeOption").onchange=changeGrade