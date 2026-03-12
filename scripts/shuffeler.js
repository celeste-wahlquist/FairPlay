// todo slider for how long you ussaly listen to the playlist before a change

function getSongs(playlist_ID, playlist_len){
    // playlist_id
    // key,         value
    // song_id,     previousplacement


    // if playlist_Id in local storage
    if (localStorage.getItem(playlist_ID)) {
        const data = JSON.parse(localStorage.getItem(playlist_ID));
    
        const historyMap = new Map();
        
        data.forEach(item => {
            historyMap.set(item.song_ID, item.previous_placement);
        });
    
    }
    else{
        var songs = fetchSongs(token, playlist_ID)

    }

} 


async function fetchSongs(token, playlist_ID) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_ID}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        console.error("API Error:", await response.text());
        return;
    }

    const data = await response.json();
    return data
}


function renderSongs(playlists) {
    const container = document.getElementById('music-list');
    if (!playlists) {
        container.innerHTML = "No playlists found.";
        return;
    }

    container.innerHTML = playlists.map(pl => `
        <li>
            <a class="song-card" onclick="alert('Song ID: ${pl.id}')">
                <img src="${pl.images[0]?.url || 'https://via.placeholder.com/60'}" alt="cover">
                <div>
                    <strong>${pl.name}</strong><br>
                </div>
            </a>
    `).join('');
}