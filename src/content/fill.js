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

function optionLabel(item) {
  return typeof item?.label === "string" ? item.label : "";
}

function readOptions(dropdown) {
  const key = Object.keys(dropdown).find((name) => name.startsWith("__reactFiber"));
  let fiber = key ? dropdown[key] : null;
  for (let index = 0; fiber && index < 25; index += 1) {
    const props = fiber.memoizedProps || {};
    const options = props.options || props.dropdownOptions?.options;
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
    const matches = options.filter((item) => optionLabel(item).toLowerCase().startsWith(query));
    matches.sort((left, right) => optionLabel(left).length - optionLabel(right).length);
    if (matches[0]) return matches[0];
  }
  const query = (label || "").trim().toLowerCase();
  if (!query || labels) return null;
  return options.find((item) => optionLabel(item).toLowerCase().includes(query)) || null;
}

function visible(el) {
  return el.getClientRects().length > 0;
}

function buttonLines(item) {
  return [item.innerText, item.getAttribute("aria-label") || ""]
    .flatMap((text) => text.split("\n"))
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
}

function matchButton(buttons, { code, option, queries }) {
  if (option) {
    const byValue = buttons.find((item) => (item.getAttribute("data-option-value") || "") === String(option.value));
    if (byValue) return byValue;
  }
  if (code) {
    const byCode = buttons.find((item) => (item.getAttribute("data-option-value") || "").toUpperCase() === code.toUpperCase());
    if (byCode) return byCode;
  }
  for (const query of queries) {
    const needle = query.toLowerCase();
    const matches = buttons.filter((item) => buttonLines(item).some((line) => line.startsWith(needle)));
    matches.sort((left, right) => left.innerText.length - right.innerText.length);
    if (matches[0]) return matches[0];
  }
  return null;
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
  const openBefore = new Set(
    [...document.querySelectorAll("[data-component-name='DropdownOptions']")].filter(visible)
  );
  dropdown.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  dropdown.click();

  let options = [];
  for (let attempt = 0; attempt < 20 && !options.length; attempt += 1) {
    options = readOptions(dropdown);
    if (!options.length) await wait(200);
  }

  const option = findOption(options, { code, label, labels: wanted.labels });
  const queries = [optionLabel(option), label, ...labels]
    .map((item) => (item || "").trim())
    .filter((item, index, all) => item && all.indexOf(item) === index);
  const searchQuery = (optionLabel(option) || label || code).split(" +")[0].trim();
  let menu = null;
  for (let attempt = 0; attempt < 20 && !menu; attempt += 1) {
    const menus = [...document.querySelectorAll("[data-component-name='DropdownOptions']")].filter(visible);
    menu = menus.find((item) => !openBefore.has(item)) || null;
    if (!menu) await wait(100);
  }
  const search = menu?.querySelector("[data-component-name='DropdownOptionsSearch'] input") || null;
  if (search && searchQuery) {
    setInputValue(search, searchQuery);
    await wait(200);
  }

  let button = null;
  for (let attempt = 0; attempt < 12 && !button; attempt += 1) {
    const buttons = [...(menu || document).querySelectorAll("[data-component-name='DropdownOption']")].filter(visible);
    button = matchButton(buttons, { code, option, queries });
    if (!button) await wait(150);
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

function fillYesNo(name, value) {
  const answer = (value || "").trim();
  if (!answer) return "skip";
  const radioValue = answer === "yes" ? "true" : "false";
  const radio = document.querySelector(`input[name="${name}"][value="${radioValue}"]`);
  if (!radio) return "missing";
  if (!radio.checked) radio.click();
  return radio.checked ? "filled" : "missing";
}

async function waitFor(read) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const found = read();
    if (found) return found;
    await wait(100);
  }
  return null;
}

async function fillDocument(profile) {
  const notBrazilian = profile.notBrazilian === "on";
  const box = document.querySelector("input[name='isNotBrazilian']");
  if (!notBrazilian || !box) {
    if (box?.checked) {
      box.click();
      await waitFor(() => {
        const cpf = document.querySelector("input[name='document.value']");
        return cpf && !cpf.disabled ? cpf : null;
      });
    }
    return {
      notBrazilian: notBrazilian ? "missing" : "skip",
      cpf: fillText("input[name='document.value']", formatCpf(profile.cpf)),
      documentCountry: "skip",
      documentId: "skip"
    };
  }
  if (!box.checked) box.click();
  await waitFor(() => {
    const id = document.querySelector("input[name='document.value']");
    const placeholder = (id?.placeholder || "").toLowerCase();
    return id && !id.disabled && !placeholder.includes("000") ? id : null;
  });
  return {
    notBrazilian: box.checked ? "filled" : "missing",
    cpf: "skip",
    documentCountry: await selectDropdown("document.country", { code: (profile.documentCountry || "").trim().toUpperCase() }),
    documentId: fillText("input[name='document.value']", profile.documentId)
  };
}

async function fillIndication(profile) {
  const answer = (profile.indication || "").trim();
  if (!answer) return "skip";
  const marked = fillYesNo("isIndication", answer);
  if (answer !== "yes" || marked !== "filled") return marked;
  const email = (profile.referralEmail || "").trim();
  if (!email) return "filled";
  const input = await waitFor(() => document.querySelector("input[name='referralEmail']"));
  if (!input) return "missing";
  setInputValue(input, email);
  return input.value ? "filled" : "missing";
}

const DIVERSITY_CHOICES = {
  genderIdentity: {
    field: "questionsDiversity.genderIdentity",
    options: {
      "cis-man": ["Cisgender man", "Homem Cisgênero", "Homem Cisgénero", "Hombre cisgénero"],
      "cis-woman": ["Cisgender woman", "Mulher Cisgênero", "Mulher Cisgénero", "Mujer cisgénero"],
      "trans-man": ["Transgender man", "Homem Transgênero", "Homem Transgénero", "Hombre transgénero"],
      "trans-woman": ["Transgender woman", "Mulher Transgênero", "Mulher Transgénero", "Mujer transgénero"],
      "non-binary": ["Non-binary", "Não binário", "Nao binario", "No binario"],
      agender: ["Agender", "Agênero", "Agénero"],
      fluid: ["Fluid gender", "Gênero fluido", "Género fluido"],
      skip: ["I'd rather not answer", "Prefiro não responder", "Prefiero no responder"]
    }
  },
  sexualOrientation: {
    field: "questionsDiversity.sexualOrientation",
    options: {
      homosexual: ["Homosexual", "Homossexual"],
      heterosexual: ["Heterosexual", "Heterossexual"],
      bisexual: ["Bisexual", "Bissexual"],
      pansexual: ["Pansexual"],
      asexual: ["Asexual", "Assexual"],
      other: ["Other", "Outro", "Otro"],
      skip: ["I'd rather not answer", "Prefiro não responder", "Prefiero no responder"]
    }
  },
  colourAndEthnicity: {
    field: "questionsDiversity.colourAndEthnicity",
    options: {
      yellow: ["Yellow", "Amarela", "Amarilla"],
      indigenous: ["Indigenous", "Indígena", "Indigena"],
      white: ["White", "Branca", "Blanca"],
      brown: ["Brown", "Parda"],
      black: ["Black", "Preta", "Negra"],
      skip: ["I'd rather not answer", "Prefiro não responder", "Prefiero no responder"]
    }
  }
};

async function fillChoice(key, profile) {
  const choice = DIVERSITY_CHOICES[key];
  const selected = (profile[key] || "").trim();
  if (!selected) return "skip";
  const labels = choice.options[selected];
  if (!labels) return "skip";
  if (!document.querySelector(`input[name="${choice.field}"]`)) return "missing";
  return selectDropdown(choice.field, { labels });
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
  const documentFields = await fillDocument(profile);
  const results = {
    name: fillText("#name", profile.name),
    ...documentFields,
    email: fillText("#email", profile.email),
    linkedin: fillText("#linkedinUsername", profile.linkedin),
    phone: fillText("#phone", profile.phone),
    country: await fillCountry(profile.country),
    city: await fillCity(profile.city),
    workModel: fillYesNo("workModel", profile.workModel),
    resume: await fillResume(profile),
    salary: fillText("#salaryExpectation", formatSalary(profile.salary)),
    contractType: fillContract(profile.contractType),
    indication: await fillIndication(profile),
    diversity: marks.length ? fillDiversityGroups(marks) : "skip",
    genderIdentity: await fillChoice("genderIdentity", profile),
    sexualOrientation: await fillChoice("sexualOrientation", profile),
    colourAndEthnicity: await fillChoice("colourAndEthnicity", profile),
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
