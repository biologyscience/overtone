const watcher = chokidar.watch(util.read.config().checkMusicIn);

function add(path)
{
    if (!util.validateMusicFileFormat(path)) return;

    const
        split = path.split('\\'),
        file = split[split.length - 1],
        folder = split.splice(0, split.length - 1).join('\\'),

        songList = new util.json('app/json/songList.json'),
        data = songList.read();

    data[folder].push(file);

    songList.save();
};

function unlink(path)
{
    if (!util.validateMusicFileFormat(path)) return;

    const
        split = path.split('\\'),
        file = split[split.length - 1],
        folder = split.splice(0, split.length - 1).join('\\'),

        songList = new util.json('app/json/songList.json'),
        data = songList.read(),
        int = data[folder].indexOf(file);

    data[folder].splice(int, 1);

    songList.save();
};

function addDir(path)
{
    const songs = fs.readdirSync(path).filter(util.validateMusicFileFormat);

    if (songs.length === 0) return;

    const config = new util.json('app/json/config.json');

    config.read().checkMusicIn.push(path);
    config.save();

    watcher.add(path);

    document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: [path]}));
};

function unlinkDir(path)
{
    if (!util.read.config().checkMusicIn.includes(path)) return;

    const
        songList = new util.json('app/json/songList.json'),
        config = new util.json('app/json/config.json'),
        songListData = songList.read(),
        configData = config.read(),
        int = configData.checkMusicIn.indexOf(path);

    delete songListData[path];
    configData.checkMusicIn.splice(int , 1);

    songList.save();
    configData.save();

    watcher.unwatch(path);
};

watcher.on('ready', () =>
{
    watcher
    .on('add', add)
    .on('unlink', unlink)
    .on('addDir', addDir)
    .on('unlinkDir', unlinkDir);
});