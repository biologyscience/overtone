const audioVisualizer = document.getElementById('audioVisualizers');

const bass = audioVisualizer.querySelector('.bass');
const vocals = audioVisualizer.querySelector('.vocals');
const highHats = audioVisualizer.querySelector('.highHats');

const bassRange = bass.dataset.range.split('-').map(x => parseInt(x));
const vocalsRange = vocals.dataset.range.split('-').map(x => parseInt(x));
const highHatsRange = highHats.dataset.range.split('-').map(x => parseInt(x));

const barWidth = parseInt(audioVisualizer.dataset.barWidth);
const barGap = parseInt(audioVisualizer.dataset.barGap);

const bassWidth = (bassRange[1] - bassRange[0]) * barGap;
const vocalsWidth = (vocalsRange[1] - vocalsRange[0]) * barGap;
const highHatsWidth = (highHatsRange[1] - highHatsRange[0]) * barGap;

bass.setAttribute('width', `${bassWidth}px`);
vocals.setAttribute('width', `${vocalsWidth}px`);
highHats.setAttribute('width', `${highHatsWidth}px`);