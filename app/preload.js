const
    fs = require('fs'),
    path = require('path'),
    chokidar = require('chokidar'),
    { contextBridge, ipcRenderer } = require('electron'),
    electronRemote = require('@electron/remote'),
    RPC = require('discord-rpc'),
    { parseFile } = require('music-metadata'),
    sharp = require('sharp'),
    sortableDND = require('sortable-dnd');

const NODE =
{
    fs,
    path,
    chokidar,
    RPC,
    parseFile,
    ipcRenderer,
    electronRemote,
    sharp,
    sortableDND
};

contextBridge.exposeInMainWorld('NODE', NODE);
contextBridge.exposeInMainWorld('UTIL', require('./js/util'));