{
    let
        wait = false,
        lastInput;

    function search({currentTarget})
    {
        const input = currentTarget;

        if (wait) return;
    
        wait = true;
        
        const songListInFolder = document.getElementById('songListInFolder');
    
        if (lastInput === input.value.toLowerCase()) return wait = false;
    
        lastInput = input.value.toLowerCase();
    
        const children = Array.from(songListInFolder.children);
    
        children.forEach(x => x.classList.remove('displayNone'));

        const filtered = children.filter(x => !x.dataset.title.includes(lastInput));

        filtered.length === children.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
        
        filtered.forEach(x => x.classList.add('displayNone'));
    
        setTimeout(() =>
        {
            wait = false;
    
            if (lastInput === input.value.toLowerCase()) return;
    
            search();
        }, 500);
    };

    document.getElementById('folderInput').addEventListener('input', search);
}