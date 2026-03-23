import { settingsViewModel } from "../viewmodels/SettingsViewModel";

export function setupSettingsUI() {
  const familyNameInput = document.getElementById(
    "family-name-input",
  ) as HTMLInputElement;
  const saveNameBtn = document.getElementById("save-family-name-btn");

  const generateInviteBtn = document.getElementById("generate-invite-btn");
  const inviteCodeDisplay = document.getElementById("invite-code-display");

  const joinCodeInput = document.getElementById(
    "join-code-input",
  ) as HTMLInputElement;
  const joinFamilyBtn = document.getElementById("join-family-btn");

  const childrenList = document.getElementById("children-list");
  const newChildName = document.getElementById(
    "new-child-name",
  ) as HTMLInputElement;
  const newChildColor = document.getElementById(
    "new-child-color",
  ) as HTMLInputElement;
  const addChildBtn = document.getElementById("add-child-btn");

  // Observers
  settingsViewModel.family.subscribe((family) => {
    if (family && familyNameInput) familyNameInput.value = family.name;
  });

  settingsViewModel.inviteCode.subscribe((code) => {
    if (code && inviteCodeDisplay) {
      inviteCodeDisplay.innerText = `Your Code: ${code} (Valid for 15 mins)`;
    }
  });

  settingsViewModel.children.subscribe((children) => {
    if (!childrenList) return;
    childrenList.innerHTML = "";

    children.forEach((child) => {
      const li = document.createElement("li");
      li.style.cssText =
        "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;";
      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: ${child.color};"></div>
          <span style="font-size: 16px; color: #1d1d1f;">${child.name}</span>
        </div>
        <button data-id="${child.id}" class="remove-child-btn" style="padding: 4px 8px; background: transparent; color: #ff3b30; border: 1px solid #ff3b30; border-radius: 6px; cursor: pointer;">Remove</button>
      `;
      childrenList.appendChild(li);
    });

    document.querySelectorAll(".remove-child-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
        if (id) settingsViewModel.removeChild(id);
      });
    });
  }, true);

  // Event Listeners
  saveNameBtn?.addEventListener("click", () => {
    settingsViewModel.updateFamilyName(familyNameInput.value);
  });

  generateInviteBtn?.addEventListener("click", () => {
    settingsViewModel.generateInvite();
  });

  joinFamilyBtn?.addEventListener("click", () => {
    if (joinCodeInput.value) {
      settingsViewModel.joinFamily(joinCodeInput.value);
    }
  });

  addChildBtn?.addEventListener("click", () => {
    if (newChildName.value && newChildColor.value) {
      settingsViewModel.addChild(newChildName.value, newChildColor.value);
      newChildName.value = ""; // Reset input
      newChildColor.value = "#ff3b30"; // Reset color to default
    }
  });
}
