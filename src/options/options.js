const STORAGE_KEY = "profile";
const MAX_RESUME_BYTES = 6 * 1024 * 1024;
const form = document.querySelector("#profile");
const status = document.querySelector("#status");
const resumeName = document.querySelector("#resume-name");
const resumeClear = document.querySelector("#resume-clear");
let savedResume = null;
let dropResume = false;

function formatCpf(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatSalary(raw, complete) {
  const cleaned = (raw || "").replace(/[^\d,]/g, "");
  if (!cleaned) return "";
  const comma = cleaned.indexOf(",");
  const reais = (comma === -1 ? cleaned : cleaned.slice(0, comma)).replace(/^0+(?=\d)/, "");
  const cents = comma === -1 ? "" : cleaned.slice(comma + 1).replace(/\D/g, "").slice(0, 2);
  const grouped = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (!complete) {
    if (comma === -1) return reais ? `R$ ${grouped}` : "";
    return `R$ ${grouped || "0"},${cents}`;
  }
  return `R$ ${grouped || "0"},${(cents + "00").slice(0, 2)}`;
}

function bindMask(input, format) {
  input.addEventListener("input", () => {
    const next = format(input.value);
    if (input.value === next) return;
    input.value = next;
    input.setSelectionRange(next.length, next.length);
  });
}

function resumeFromProfile(profile) {
  if (!profile.resumeData || !profile.resumeName) return null;
  return {
    name: profile.resumeName,
    type: profile.resumeType || "application/pdf",
    data: profile.resumeData
  };
}

function showResume() {
  const picked = form.elements.resume.files[0];
  const current = picked?.name || (!dropResume && savedResume?.name) || "";
  resumeName.textContent = current ? `Arquivo: ${current}` : "Nenhum currículo escolhido.";
  resumeClear.hidden = !current;
}

function readResume(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma === -1 ? "" : result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

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
  form.elements.cpf.value = formatCpf(form.elements.cpf.value);
  form.elements.salary.value = formatSalary(form.elements.salary.value, true);
  savedResume = resumeFromProfile(profile);
  dropResume = false;
  showResume();
}

bindMask(form.elements.cpf, formatCpf);
bindMask(form.elements.salary, (value) => formatSalary(value, false));
form.elements.salary.addEventListener("blur", () => {
  form.elements.salary.value = formatSalary(form.elements.salary.value, true);
});

form.elements.resume.addEventListener("change", () => {
  const file = form.elements.resume.files[0];
  if (file && !/\.(pdf|docx)$/i.test(file.name)) {
    form.elements.resume.value = "";
    status.textContent = "O currículo precisa ser PDF ou DOCX.";
  } else if (file && file.size > MAX_RESUME_BYTES) {
    form.elements.resume.value = "";
    status.textContent = "O currículo precisa ter até 6 MB.";
  } else if (file) {
    dropResume = false;
    status.textContent = "";
  }
  showResume();
});

resumeClear.addEventListener("click", () => {
  form.elements.resume.value = "";
  savedResume = null;
  dropResume = true;
  showResume();
});

showResume();

globalThis.chrome?.storage?.local.get(STORAGE_KEY).then((stored) => {
  applyProfile(stored[STORAGE_KEY] || {});
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  form.elements.cpf.value = formatCpf(form.elements.cpf.value);
  form.elements.salary.value = formatSalary(form.elements.salary.value, true);
  const profile = Object.fromEntries(new FormData(form));
  delete profile.resume;
  delete profile.consent;
  const picked = form.elements.resume.files[0];
  if (picked) {
    profile.resumeName = picked.name;
    profile.resumeType = picked.type || "application/octet-stream";
    profile.resumeData = await readResume(picked);
  } else if (!dropResume && savedResume) {
    profile.resumeName = savedResume.name;
    profile.resumeType = savedResume.type;
    profile.resumeData = savedResume.data;
  }
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: profile });
  } catch {
    status.textContent = "Não coube neste Chrome. Use um currículo de até 6 MB.";
    return;
  }
  savedResume = resumeFromProfile(profile);
  dropResume = false;
  form.elements.resume.value = "";
  showResume();
  status.textContent = "Perfil salvo neste Chrome.";
});
