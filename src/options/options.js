const STORAGE_KEY = "profile";
const form = document.querySelector("#profile");
const status = document.querySelector("#status");

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
}

bindMask(form.elements.cpf, formatCpf);
bindMask(form.elements.salary, (value) => formatSalary(value, false));
form.elements.salary.addEventListener("blur", () => {
  form.elements.salary.value = formatSalary(form.elements.salary.value, true);
});

globalThis.chrome?.storage?.local.get(STORAGE_KEY).then((stored) => {
  applyProfile(stored[STORAGE_KEY] || {});
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  form.elements.cpf.value = formatCpf(form.elements.cpf.value);
  form.elements.salary.value = formatSalary(form.elements.salary.value, true);
  const profile = Object.fromEntries(new FormData(form));
  await chrome.storage.local.set({ [STORAGE_KEY]: profile });
  status.textContent = "Perfil salvo neste Chrome.";
});
