{
    let
        wait = false,
        lastInput;

    const
        sectionAlbum = document.querySelector('section.album'),
        input = sectionAlbum.querySelector('.head input');
        
    function search()
    {
        const inputValue = input.value;

        if (wait) return;
    
        wait = true;
    
        if (lastInput === inputValue.toLowerCase()) return wait = false;
    
        lastInput = inputValue.toLowerCase();

        const albumItems = [...sectionAlbum.querySelectorAll('.body .albumItem')];
    
        albumItems.forEach(x => x.classList.remove('displayNone'));
    
        albumItems
        .filter(x => !x.dataset.albumName.toLowerCase().includes(lastInput))
        .forEach(x => x.classList.add('displayNone'));
    
        setTimeout(() =>
        {
            wait = false;
    
            if (lastInput === inputValue.toLowerCase()) return;
    
            search();
        }, 500);
    };
    
    input.addEventListener('input', search);
}