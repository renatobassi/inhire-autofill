const STORAGE_KEY = "profile";

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setInputValue(input, value) {
  const prototype = input instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
  if (input._valueTracker) input._valueTracker.setValue("");
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function readOptions(dropdown) {
  const key = Object.keys(dropdown).find((name) => name.startsWith("__reactFiber"));
  let fiber = key ? dropdown[key] : null;
  for (let index = 0; fiber && index < 15; index += 1) {
    const options = fiber.memoizedProps?.options;
    if (Array.isArray(options) && options.length) return options;
    fiber = fiber.return;
  }
  return [];
}

function findOption(options, { code, label }) {
  if (code) {
    const wanted = code.toUpperCase();
    const byCode = options.find((item) => String(item.value).toUpperCase() === wanted);
    if (byCode) return byCode;
  }
  const query = (label || "").trim().toLowerCase();
  if (!query) return null;
  const matches = options.filter((item) => String(item.label).toLowerCase().startsWith(query));
  matches.sort((left, right) => String(left.label).length - String(right.label).length);
  return matches[0] || options.find((item) => String(item.label).toLowerCase().includes(query)) || null;
}

async function selectDropdown(fieldName, wanted) {
  const code = (wanted.code || "").trim();
  const label = (wanted.label || "").trim();
  if (!code && !label) return "skip";
  const hidden = document.querySelector(`input[name="${fieldName}"]`);
  const dropdown = hidden?.closest("[aria-label='Dropdown select']");
  if (!dropdown) return "missing";

  document.body.click();
  await wait(150);
  dropdown.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  dropdown.click();

  let options = [];
  for (let attempt = 0; attempt < 12 && !options.length; attempt += 1) {
    options = readOptions(dropdown);
    if (!options.length) await wait(200);
  }

  const option = findOption(options, { code, label });
  const search = document.querySelector("[data-component-name='DropdownOptionsSearch'] input");
  if (search) {
    const query = String(option?.label || label || code).split(" +")[0].trim();
    setInputValue(search, query);
    await wait(350);
  }

  const button = [...document.querySelectorAll("[data-component-name='DropdownOption']")].find((item) => {
    const value = item.getAttribute("data-option-value") || "";
    if (option) return value === String(option.value);
    return value.toUpperCase() === code.toUpperCase();
  });
  if (!button) return "missing";
  button.click();
  await wait(150);
  return hidden.value ? "filled" : "missing";
}

function formatCpf(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatSalary(raw) {
  const cleaned = (raw || "").replace(/[^\d,]/g, "");
  if (!cleaned) return "";
  const comma = cleaned.indexOf(",");
  const reais = (comma === -1 ? cleaned : cleaned.slice(0, comma)).replace(/^0+(?=\d)/, "") || "0";
  const cents = ((comma === -1 ? "" : cleaned.slice(comma + 1)) + "00").slice(0, 2);
  const grouped = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${grouped},${cents}`;
}

function fillText(selector, value) {
  const text = (value || "").trim();
  if (!text) return "skip";
  const input = document.querySelector(selector);
  if (!input) return "missing";
  setInputValue(input, text);
  return input.value ? "filled" : "missing";
}

function resumeFile(profile) {
  if (!profile.resumeData || !profile.resumeName) return null;
  const binary = atob(profile.resumeData);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], profile.resumeName, { type: profile.resumeType || "application/pdf" });
}

async function fillResume(profile) {
  const file = resumeFile(profile);
  if (!file) return "skip";
  const input = document.querySelector("input[type='file'][name='resume']");
  if (!input) return "missing";
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  const needle = file.name.length > 25 ? file.name.slice(0, 16) : file.name;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    await wait(250);
    if (document.body.innerText.includes(needle)) return "filled";
  }
  return "missing";
}

function fillContract(value) {
  const contract = (value || "").trim();
  if (!contract) return "skip";
  const radio = document.querySelector(`input[name="contractType"][value="${contract}"]`);
  if (!radio) return "missing";
  radio.click();
  return radio.checked ? "filled" : "missing";
}

async function fillCity(city) {
  const text = (city || "").trim();
  if (!text) return "skip";
  let dropdown = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    dropdown = document.querySelector("input[name='districtBr']");
    if (dropdown) break;
    await wait(150);
  }
  if (dropdown) return selectDropdown("districtBr", { label: text });
  return fillText("#district, input[name='district']", text);
}

async function fillInformation(profile) {
  const results = {
    name: fillText("#name", profile.name),
    cpf: fillText("input[name='document.value']", formatCpf(profile.cpf)),
    email: fillText("#email", profile.email),
    linkedin: fillText("#linkedinUsername", profile.linkedin),
    phone: fillText("#phone", profile.phone),
    city: await fillCity(profile.city),
    resume: await fillResume(profile),
    salary: fillText("#salaryExpectation", formatSalary(profile.salary)),
    contractType: fillContract(profile.contractType)
  };
  document.body.click();
  return results;
}

function summarize(results) {
  const filled = Object.entries(results).filter(([, status]) => status === "filled").map(([field]) => field);
  const missing = Object.entries(results).filter(([, status]) => status === "missing").map(([field]) => field);
  if (!filled.length && !missing.length) return "Salve o perfil nas opções da extensão.";
  if (!missing.length) return `Preenchidos: ${filled.length}.`;
  return `Preenchidos: ${filled.length}. Não achei: ${missing.join(", ")}.`;
}

async function runFill() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const profile = stored[STORAGE_KEY] || {};
  const results = await fillInformation(profile);
  const message = summarize(results);
  const status = document.querySelector("#inhire-autofill-status");
  if (status) status.textContent = message;
  return { message, results };
}

function mountButton() {
  if (document.querySelector("#inhire-autofill")) return;
  const root = document.createElement("div");
  root.id = "inhire-autofill";
  const button = document.createElement("button");
  button.type = "button";
  button.id = "inhire-autofill-button";
  button.textContent = "Preencher";
  const status = document.createElement("p");
  status.id = "inhire-autofill-status";
  button.addEventListener("click", () => {
    status.textContent = "Preenchendo…";
    runFill().catch(() => {
      status.textContent = "Não consegui preencher esta página.";
    });
  });
  root.append(button, status);
  document.documentElement.append(root);
}

mountButton();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fill") return undefined;
  runFill()
    .then(sendResponse)
    .catch(() => sendResponse({ message: "Não consegui preencher esta página." }));
  return true;
});
