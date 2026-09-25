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

function findOption(options, { code, label, labels }) {
  if (code) {
    const wanted = code.toUpperCase();
    const byCode = options.find((item) => String(item.value).toUpperCase() === wanted);
    if (byCode) return byCode;
  }
  const queries = (labels || [label]).map((item) => (item || "").trim().toLowerCase()).filter(Boolean);
  for (const query of queries) {
    const matches = options.filter((item) => String(item.label).toLowerCase().startsWith(query));
    matches.sort((left, right) => String(left.label).length - String(right.label).length);
    if (matches[0]) return matches[0];
  }
  const query = (label || "").trim().toLowerCase();
  if (!query || labels) return null;
  return options.find((item) => String(item.label).toLowerCase().includes(query)) || null;
}

async function selectDropdown(fieldName, wanted) {
  const code = (wanted.code || "").trim();
  const label = (wanted.label || "").trim();
  const labels = wanted.labels || [];
  if (!code && !label && !labels.length) return "skip";
  const hidden = document.querySelector(`input[name="${fieldName}"]`);
  const dropdown = hidden?.closest("[aria-label='Dropdown select']");
  if (!dropdown) return "missing";

  document.body.click();
  await wait(150);
  dropdown.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  dropdown.click();

  let options = [];
  for (let attempt = 0; attempt < 20 && !options.length; attempt += 1) {
    options = readOptions(dropdown);
    if (!options.length) await wait(200);
  }

  const option = findOption(options, { code, label, labels: wanted.labels });
  const query = (label || String(option?.label || labels[0] || code)).split(" +")[0].trim();
  let search = null;
  for (let attempt = 0; attempt < 15 && !search; attempt += 1) {
    const inputs = [...document.querySelectorAll("[data-component-name='DropdownOptionsSearch'] input")];
    search = inputs.find((input) => input.getClientRects().length) || null;
    if (!search) await wait(100);
  }
  if (search && query) setInputValue(search, query);

  let button = null;
  for (let attempt = 0; attempt < 12 && !button; attempt += 1) {
    await wait(150);
    const buttons = [...document.querySelectorAll("[data-component-name='DropdownOption']")];
    if (option) {
      button = buttons.find((item) => (item.getAttribute("data-option-value") || "") === String(option.value)) || null;
    }
    if (!button && code) {
      button = buttons.find((item) => (item.getAttribute("data-option-value") || "").toUpperCase() === code.toUpperCase()) || null;
    }
    if (!button && query) {
      const matches = buttons.filter((item) => item.innerText.trim().toLowerCase().startsWith(query.toLowerCase()));
      matches.sort((left, right) => left.innerText.length - right.innerText.length);
      button = matches[0] || null;
    }
  }
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

function resumeBytes(profile) {
  if (!profile.resumeData || !profile.resumeName) return null;
  const binary = atob(profile.resumeData);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return {
    name: profile.resumeName,
    mime: profile.resumeType || "application/pdf",
    bytes
  };
}

function attachResume(file) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(false);
    }, 2000);
    function onMessage(event) {
      if (event.source !== window || event.data?.type !== "inhire-autofill-resume-done") return;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(event.data.ok === true);
    }
    window.addEventListener("message", onMessage);
    window.postMessage({
      type: "inhire-autofill-resume",
      name: file.name,
      mime: file.mime,
      bytes: file.bytes
    }, "*");
  });
}

async function fillResume(profile) {
  const file = resumeBytes(profile);
  if (!file) return "skip";
  const input = document.querySelector("input[type='file'][name='resume']");
  if (!input) return "missing";
  const attached = await attachResume(file);
  if (!attached) return "missing";
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

async function fillCountry(code) {
  const wanted = (code || "BR").trim().toUpperCase();
  if (!wanted) return "skip";
  const hidden = document.querySelector("input[name='country']");
  if (!hidden) return "missing";
  if (hidden.value.trim()) return "skip";
  return selectDropdown("country", { code: wanted });
}

async function fillCity(city) {
  const text = (city || "").trim();
  if (!text) return "skip";
  const country = document.querySelector("input[name='country']")?.value || "";
  const inBrazil = /\(BR\)|brasil|brazil/i.test(country);
  let dropdown = null;
  for (let attempt = 0; attempt < (inBrazil ? 20 : 8); attempt += 1) {
    dropdown = document.querySelector("input[name='districtBr']");
    if (dropdown) break;
    await wait(200);
  }
  if (dropdown) return selectDropdown("districtBr", { label: text });
  if (inBrazil) return "missing";
  return fillText("#district, input[name='district']", text);
}

const DIVERSITY_MARKS = [
  ["diversityBlack", ["black person", "pessoa negra", "pessoa preta", "persona negra"]],
  ["diversityBrown", ["brown person", "pessoa parda", "persona parda"]],
  ["diversityIndigenous", ["indigenous", "indígena", "indigena"]],
  ["diversityWoman", ["woman", "mulher", "mujer"]],
  ["diversityDisability", ["disabilit", "deficiên", "deficien", "discapacidad"]],
  ["diversityLgbt", ["lgbti", "lgbt"]],
  ["diversityNone", ["don't belong", "do not belong", "nenhum dos grupos", "nenhum grupo", "não perten", "nao perten", "no pertenezco"]],
  ["diversitySkip", ["rather not", "prefiro não", "prefiro nao", "prefiero no"]]
];

function diversityMarks(profile) {
  const chosen = DIVERSITY_MARKS.filter(([key]) => profile[key] === "on").map(([key]) => key);
  if (chosen.includes("diversitySkip")) return ["diversitySkip"];
  if (chosen.includes("diversityNone")) return ["diversityNone"];
  return chosen;
}

function fillDiversityGroups(marks) {
  const form = document.querySelector("[data-component-name='DiversityForm']");
  if (!form) return "missing";
  const boxes = [...form.querySelectorAll("input[type='checkbox']")].filter((el) => el.name !== "privacyPolicy");
  let missed = false;
  for (const mark of marks) {
    const tokens = DIVERSITY_MARKS.find(([key]) => key === mark)[1];
    const box = boxes.find((el) => {
      const text = (el.closest("label")?.innerText || "").toLowerCase();
      return tokens.some((token) => text.includes(token));
    });
    if (!box) {
      missed = true;
      continue;
    }
    if (!box.checked) box.click();
    if (!box.checked) missed = true;
  }
  return missed ? "missing" : "filled";
}

async function fillDiversityApply(value) {
  const answer = (value || "").trim();
  if (!answer) return "skip";
  const labels = answer === "yes" ? ["Yes", "Sim", "Sí"] : ["No", "Não", "Nao"];
  return selectDropdown("questionsDiversity.peopleWithDisability", { labels });
}

async function fillInformation(profile) {
  const marks = diversityMarks(profile);
  const results = {
    name: fillText("#name", profile.name),
    cpf: fillText("input[name='document.value']", formatCpf(profile.cpf)),
    email: fillText("#email", profile.email),
    linkedin: fillText("#linkedinUsername", profile.linkedin),
    phone: fillText("#phone", profile.phone),
    country: await fillCountry(profile.country),
    city: await fillCity(profile.city),
    resume: await fillResume(profile),
    salary: fillText("#salaryExpectation", formatSalary(profile.salary)),
    contractType: fillContract(profile.contractType),
    diversity: marks.length ? fillDiversityGroups(marks) : "skip",
    diversityApply: await fillDiversityApply(profile.diversityApply)
  };
  document.body.click();
  return results;
}

function summarize(results) {
  const statuses = Object.values(results);
  const filled = statuses.filter((status) => status === "filled").length;
  const attempted = statuses.some((status) => status === "filled" || status === "missing");
  if (!attempted) return "Salve o perfil nas opções da extensão.";
  return `Preenchidos: ${filled}.`;
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
