function create({detail: {filePath, picName}})
{
    util.getAlbumArt(filePath).then((pic) =>
    {
        if (pic.buffer === undefined) return;
        
        sharp(pic.buffer)
        .resize(500, 500)
        .toFormat('webp')
        .toFile(`app/webp/${picName}.webp`);
    });
};

document.addEventListener('-createWEBPalbumArt', create);