const { watch } = require('chokidar');

const watcher = watch(require('./js/util').read.config().checkMusicIn);

function add(path)
{
    const { json, validateMusicFileFormat } = require('./js/util');

    if (!validateMusicFileFormat(path)) return;

    const
        split = path.split('\\'),
        file = split[split.length - 1],
        folder = split.splice(0, split.length - 1).join('\\'),

        songList = new json('app/json/songList.json'),
        data = songList.read();

    data[folder].push(file);

    songList.save();
};

function unlink(path)
{
    const { json, validateMusicFileFormat } = require('./js/util');

    if (!validateMusicFileFormat(path)) return;

    const
        split = path.split('\\'),
        file = split[split.length - 1],
        folder = split.splice(0, split.length - 1).join('\\'),

        songList = new json('app/json/songList.json'),
        data = songList.read(),
        int = data[folder].indexOf(file);

    data[folder].splice(int, 1);

    songList.save();
};

function addDir(path)
{
    const { json, validateMusicFileFormat } = require('./js/util');

    const songs = require('fs').readdirSync(path).filter(validateMusicFileFormat);

    if (songs.length === 0) return;

    const
        songList = new json('app/json/songList.json'),
        config = new json('app/json/config.json'),
        songListData = songList.read(),
        configData = config.read();

    songListData[path] = songs;
    configData.checkMusicIn.push(path);

    songList.save();
    configData.save();

    watcher.add(path);
};

function unlinkDir(path)
{
    const { read, json } = require('./js/util');

    if (!read.config().checkMusicIn.includes(path)) return;

    const
        songList = new json('app/json/songList.json'),
        config = new json('app/json/config.json'),
        songListData = songList.read(),
        configData = config.read(),
        int = configData.checkMusicIn.indexOf(path);

    delete songListData[path];
    configData.checkMusicIn.splice(int , 1);

    songList.save();
    configData.save();

    watcher.unwatch(path)
};

watcher.on('ready', () =>
{
    watcher
    .on('add', add)
    .on('unlink', unlink)
    .on('addDir', addDir)
    .on('unlinkDir', unlinkDir);
});