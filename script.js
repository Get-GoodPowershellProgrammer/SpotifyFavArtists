const clientId = process.env.SPOTIFY_API_KEY || "PLACEHOLDER_CLIENT_ID"; //TODO: Poner ID de verdad
const redirectUri = "PLACEHOLDER_REDIRECT_URI"; //TODO: Poner URL de verdad
const scopes = ["user-read-private", "user-read-email", "user-library-read"];

function redirectToSpotifyAuth() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;
  window.open(authUrl, "_blank");
}

// Extract the access token from the URL
function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    return params.get("access_token");
  }
  return null;
}

function main() {
  const token = getAccessTokenFromUrl();

  if (!token) {
    document
      .getElementById("loginBtn")
      .addEventListener("click", redirectToSpotifyAuth);
  } else {
    // Token received – make Spotify API requests
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then((res) => res.json())
      .then((data) => {
        document.getElementById(
          "output"
        ).textContent = `Bienvenido, ${data.display_name}`;

        return fetch(
          "https://api.spotify.com/v1/me/tracks?offset=0&limit=20&locale=es-US",
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );
      })
      .then((res) => res.json())
      .then((trackData) => {
        console.log("Data: " + JSON.stringify(trackData, null, 2));

        const arts = document.querySelectorAll("#artSect article");
        const firstThree = trackData.items.slice(0, 3);
        firstThree.forEach((item, index) => {
          const track = item.track;
          const article = arts[index]; // use pre-existing <article>
          const img = article.querySelector("img");
          const p = article.querySelector("p");
          const btn = document.createElement("button");
           btn.onclick = function () {
            window.open(track.external_urls.spotify, "_blank");
            
          };
          btn.textContent = track.name;
          article.appendChild(btn);
          
          const artist = track.artists[0].name;
          p.textContent = artist;
          img.src = track.album.images[0]?.url;
        });
      });
  }
}
