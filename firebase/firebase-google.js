import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyDl8rk3KAYc4-AiNAUvAkeoAPopfRI8tm4",
  authDomain: "editconnect-77505.firebaseapp.com",
  projectId: "editconnect-77505",
  appId: "1:279328250493:web:85b70045215e737523ef14"
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const USERS = "editconnect_users_v1", SESSION = "editconnect_session_v1";

const ERR = {
  "auth/unauthorized-domain": "Firebase doesn't know this website yet. Add dheerajisaireddy.github.io under Authentication > Settings > Authorized domains.",
  "auth/operation-not-allowed": "Google sign-in is switched off. Turn it on under Authentication > Sign-in method.",
  "auth/popup-blocked": "Your browser blocked the Google pop-up. Allow pop-ups for this site and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
  "auth/network-request-failed": "Check your internet connection."
};

function show(msg) {
  const r = document.getElementById("ob-result");
  r.textContent = msg;
  r.hidden = false;
}

async function googleLogin() {
  try {
    const { user } = await signInWithPopup(auth, provider);
    const email = (user.email || "").toLowerCase();
    let users = [];
    try { users = JSON.parse(localStorage.getItem(USERS) || "[]"); } catch (e) {}
    let u = users.find(x => x.email === email);
    if (!u) {
      const picked = document.querySelector('#ob-form input[name="role"]:checked');
      u = {
        id: user.uid, provider: "google",
        name: user.displayName || email.split("@")[0],
        email, picture: user.photoURL || "",
        role: picked ? picked.value : "Student / Beginner Freelancer",
        skill: "", portfolio: "", firstClientRegistered: false,
        joinedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      };
      users.unshift(u);
    } else {
      u.provider = "google";
      u.name = user.displayName || u.name;
      u.picture = user.photoURL || u.picture;
    }
    localStorage.setItem(USERS, JSON.stringify(users));
    localStorage.setItem(SESSION, JSON.stringify(u));
    location.hash = "#community";
    location.reload();
  } catch (e) {
    if (String(e.code).includes("requests-from-referer")) {
      show("Your Firebase API key blocks this website. In Google Cloud Console > APIs & Services > Credentials, add https://dheerajisaireddy.github.io/* to the key's allowed websites.");
    } else {
      show(ERR[e.code] || e.message || "Google sign-in failed.");
    }
  }
}

document.addEventListener("click", e => {
  if (!e.target.closest("#g-fallback-btn")) return;
  e.stopImmediatePropagation();
  e.preventDefault();
  googleLogin();
}, true);

const label = document.querySelector("#g-fallback-btn span");
if (label) label.textContent = "Continue with Google";
