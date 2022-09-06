{
    let
        wait = false,
        lastInput;

    const input = document.getElementById('searchInput');

    function search()
    {
        if (wait) return;
    
        wait = true;
        
        const songListInFolder = document.getElementById('songListInFolder');
    
        if (lastInput === input.value.toLowerCase()) return wait = false;
    
        lastInput = input.value.toLowerCase();
    
        const children = Array.from(songListInFolder.children);
    
        children.forEach(x => x.classList.remove('displayNone'));
    
        children
        .filter(x => !x.dataset.title.includes(lastInput))
        .forEach(x => x.classList.add('displayNone'));
    
        setTimeout(() =>
        {
            wait = false;
    
            if (lastInput === input.value.toLowerCase()) return;
    
            search();
        }, 500);
    };

    input.addEventListener('input', search);
}