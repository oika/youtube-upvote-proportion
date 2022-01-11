import { getChromeStorageString, saveStringToChromeStorage } from "./store-access";

const init = async () => {
    const btn = selectButton();
    if (btn == null) return;

    btn.addEventListener("click", onSave);

    const input = selectInput();
    if (input == null) return;

    // initial value
    const original = await getChromeStorageString("yt-api-key");
    if (original != null) {
        input.value = original;
    }

    input.addEventListener("change", () => setStatus(""));
}

const selectButton = () => {
    const btn = document.getElementById("btn_save");
    if (btn == null) {
        console.error("failed to find save button");
    }
    return btn;
}
const selectInput = () => {
    const input = document.getElementById("input_api_key");
    if (input == null) {
        console.error("failed to find input");
    }
    return input as HTMLInputElement;
}

const onSave = async () => {
    const input = selectInput();
    if (input == null) return;

    await saveStringToChromeStorage("yt-api-key", input.value);

    setStatus("Saved!");
}

const setStatus = (text: string) => {
    const div = document.getElementById("save_status");
    if (div == null) {
        console.error("failed to find save status");
        return;
    }

    div.textContent = text;
}



document.addEventListener("DOMContentLoaded", init);
