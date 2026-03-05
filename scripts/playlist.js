// http://127.0.0.1:5500/playlist.html?code=5 
//method of testing without commit

const clientId = "3edfcb2cdb144a9796a8c39f5ce3730a"; 
const redirectUri = 'https://fairplayer.netlify.app/playlist'; 
const scope = 'playlist-read-private streaming user-read-playback-state user-modify-playback-state';

// --- PKCE CRYPTO HELPERS ---
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// --- AUTHENTICATION FLOW ---

async function redirectToSpotify() {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });

    // FIXED: Correct Spotify Authorize URL and template syntax
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(code) {
    const codeVerifier = window.localStorage.getItem('code_verifier');

    // FIXED: Correct Spotify Token URL
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Token Error:", errorBody);
        throw new Error(`Spotify Auth Failed: ${response.status}`);
    }

    return await response.json();
}

async function fetchPlaylists(token) {
    // FIXED: Correct Spotify Web API URL
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        console.error("API Error:", await response.text());
        return;
    }

    const data = await response.json();
    renderPlaylists(data.items);
}

function renderPlaylists(playlists) {
    const container = document.getElementById('music-list');
    if (!playlists || playlists.length === 0) {
        container.innerHTML = "No playlists found.";
        return;
    }

    container.innerHTML = playlists.map(pl => `
        <li>
            <div class="playlist-card" onclick="alert('Playlist ID: ${pl.id}')">
                <img src="${pl.images?.[0]?.url || 'https://via.placeholder.com/60'}" alt="cover">
                <div>
                    <strong>${pl.name}</strong><br>
                </div>
            </div>
        </li>
    `).join(''); // Added missing </li> tag
}

const init = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const loginContainer = document.querySelector(".login-container");

    if (!code) {
        // User needs to log in
        const loginBtn = document.getElementById('loginBtn');
        const welcomeLogin = document.getElementById('welcomeLogin');
        
        if(loginBtn) loginBtn.addEventListener('click', redirectToSpotify);
        if(welcomeLogin) welcomeLogin.addEventListener('click', redirectToSpotify);

    } else if (code === "5") {
        // Dev Mode
        if(loginContainer) loginContainer.classList.add("hidden");
        console.log("Dev Mode triggered. Loading local JSON...");

        try {
            const response = await fetch('./scripts/testplaylists.json');
            const data = await response.json();
            document.getElementById('music-list').style.display = 'block';
            renderPlaylists(data.items);
        } catch (err) {
            console.error("Failed to load local JSON", err);
        }

    } else {
        // Handle successful redirect back from Spotify
        if(loginContainer) loginContainer.classList.add("hidden");
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        try {
            document.getElementById('music-list').style.display = 'block';
            const authData = await getAccessToken(code);
            if (authData.access_token) {
                window.localStorage.setItem('access_token', authData.access_token);
                fetchPlaylists(authData.access_token);
            }
        } catch (error) {
            console.error("Authentication failed", error);
        }
    }
};  

init();