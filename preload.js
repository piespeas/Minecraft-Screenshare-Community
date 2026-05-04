const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("updateUI", (data) => {
    window.dispatchEvent(new CustomEvent("ui-update", { detail: data }));
});