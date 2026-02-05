const dropdown = document.getElementById("dropdownBtn");
function toggleMenu() {
    const nav = document.getElementById("nav-opts");
    nav.classList.toggle("hidden");
}
dropdown.addEventListener("click", toggleMenu)

const lesson1 = document.getElementById("l1");
async function render_lesson(lesson_name) {
    const lesson = await import(`../lessons/${lesson_name}.js`);
}

lesson1.addEventListener("click", render_lesson);