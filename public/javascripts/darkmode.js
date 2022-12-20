if(localStorage.getItem('theme') == 'dark'){
    setDarkMode();

    if(document.getElementbyId('switchDark').checked){
        localStorage.setItem('switchDark', true)
    }
}

function setDarkMode() {
    let isDark = document.body.classList.toggle('darkMode');

    if(isDark){
        setDarkMode.checked = true;
        localStorage.setItem('theme','dark');
        document.getElementById('switchDark').setAttribute('checked', 'checked');

    }
    else{
        setDarkMode.checked = true;
        localStorage.removeItem('theme', 'dark')
    }
}



// ######################################################################
/**
 * Darkmode version 2 inaktiv
 */

const darkSwitch = document.getElementById('darkSwitch');
window.addEventListener('load', () => {
if (darkSwitch) {
    initTheme();
    darkSwitch.addEventListener('change', () => {
    resetTheme();
    });
}
});


/**
 * Summary: function that adds or removes the attribute 'data-theme' depending if
 * the switch is 'on' or 'off'.
 *
 * Description: initTheme is a function that uses localStorage from JavaScript DOM,
 * to store the value of the HTML switch. If the switch was already switched to
 * 'on' it will set an HTML attribute to the body named: 'data-theme' to a 'dark'
 * value. If it is the first time opening the page, or if the switch was off the
 * 'data-theme' attribute will not be set.
 * @return {void}
 */
function initTheme() {
const darkThemeSelected =
    localStorage.getItem('darkSwitch') !== null &&
    localStorage.getItem('darkSwitch') === 'dark';
darkSwitch.checked = darkThemeSelected;
darkThemeSelected ? document.body.setAttribute('data-theme', 'dark') :
    document.body.removeAttribute('data-theme');
}


/**
 * Summary: resetTheme checks if the switch is 'on' or 'off' and if it is toggled
 * on it will set the HTML attribute 'data-theme' to dark so the dark-theme CSS is
 * applied.
 * @return {void}
 */
function resetTheme() {
if (darkSwitch.checked) {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkSwitch', 'dark');
} else {
    document.body.removeAttribute('data-theme');
    localStorage.removeItem('darkSwitch');
}
}
