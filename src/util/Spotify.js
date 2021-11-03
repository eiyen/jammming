let accessToken;
const clientId = "75e1d0213ab1433ebada0c3c32dc6770";
const redirectUrl = "https://eiyen.github.io/jammming/callback/";

const Spotify = {

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { header: {Authorization: `Bearer ${accessToken}`}})
                .then(response => response.json())
                .then(jsonResponse => {
                    if (!jsonResponse.tracks) {
                        return [{id:-1,name:"None",artist:"None",album:"None",uri:-1}];
                    }

                    return jsonResponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }))
                });
    },

    getAccessToken() {
        if(accessToken) {
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
            window.location = accessUrl;
        }
    },

    savePlaylist(playlistName, tracksUris) {
        if (!playlistName || !tracksUris) {
            return;
        }

        let accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId = '';

        return fetch("https://api.spotify.com/v1/me", { headers: headers})
        .then(response => response.json())
        .then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name : playlistName})
            }).then(response => response.json())
            .then(jsonResponse => {
                const playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: "POST",
                    body: JSON.stringify({uris: tracksUris})
                })
            })
        })
    }
}

export default Spotify;