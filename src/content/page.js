window.addEventListener("message", (event) => {
  if (event.source !== window || event.data?.type !== "inhire-autofill-resume") return;
  const input = document.querySelector("input[type='file'][name='resume']");
  const bytes = event.data.bytes;
  if (!input || !bytes || !event.data.name) {
    window.postMessage({ type: "inhire-autofill-resume-done", ok: false }, "*");
    return;
  }
  const file = new File([bytes], event.data.name, { type: event.data.mime || "application/pdf" });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  window.postMessage({ type: "inhire-autofill-resume-done", ok: input.files.length > 0 }, "*");
});
