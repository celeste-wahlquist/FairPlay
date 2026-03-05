// FairPlay.js
console.log("FairPlay.js has loaded!");

// No need for DOMContentLoaded in a module!
const welcomeBtn = document.getElementById('welcomeLogin');

if (welcomeBtn) {
    welcomeBtn.addEventListener('click', () => {
        alert('button clicked');
    });
} else {
    console.error("Button 'welcomeLogin' not found in the DOM.");
}