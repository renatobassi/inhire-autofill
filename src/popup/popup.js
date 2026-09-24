const status = document.querySelector("#status");

document.querySelector("#options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.querySelector("#fill").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    status.textContent = "Abra uma vaga em inhire.app.";
    return;
  }
  status.textContent = "Preenchendo…";
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "fill" });
    status.textContent = response?.message || "Pedido enviado.";
  } catch {
    status.textContent = "Recarregue a página da vaga e tente de novo.";
  }
});
