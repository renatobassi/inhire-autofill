const STORAGE_KEY = "profile";
const form = document.querySelector("#profile");
const status = document.querySelector("#status");

function applyProfile(profile) {
  for (const [key, value] of Object.entries(profile)) {
    const field = form.elements.namedItem(key);
    if (!field || value == null) continue;
    if (field instanceof RadioNodeList) {
      const match = [...field].find((item) => item.value === value);
      if (match) match.checked = true;
    } else {
      field.value = value;
    }
  }
}

chrome.storage.local.get(STORAGE_KEY).then((stored) => {
  applyProfile(stored[STORAGE_KEY] || {});
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const profile = Object.fromEntries(new FormData(form));
  await chrome.storage.local.set({ [STORAGE_KEY]: profile });
  status.textContent = "Perfil salvo neste Chrome.";
});
