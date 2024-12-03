function create({detail: {filePath, picName}})
{
    util.getAlbumArt(filePath).then((pic) =>
    {
        if (pic.buffer === undefined) return;
        
        sharp(pic.buffer)
        .resize(512, 512)
        .toFormat('webp')
        .toFile(`app/webp/${picName}.webp`);
    });
};

document.addEventListener('-createWEBPalbumArt', create);