import { settingsViewModel } from "../viewmodels/SettingsViewModel";

export function setupSettingsUI() {
  const childrenList = document.getElementById("children-list");
  const addChildBtn = document.getElementById("add-child-btn");
  const newChildInput = document.getElementById(
    "new-child-name",
  ) as HTMLInputElement;
  const newChildColor = document.getElementById(
    "new-child-color",
  ) as HTMLInputElement;

  settingsViewModel.children.subscribe((children) => {
    if (!childrenList) return;
    childrenList.innerHTML = "";
    if (children.length === 0) {
      childrenList.innerHTML =
        "<li style='color: #666;'>No children added yet.</li>";
      return;
    }

    children.forEach((child) => {
      const li = document.createElement("li");
      li.style.marginBottom = "8px";
      li.style.padding = "8px 12px";
      li.style.background = "#fafafa";
      li.style.border = "1px solid #e5e5ea";
      li.style.borderRadius = "8px";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.maxWidth = "250px";

      const nameSpan = document.createElement("span");
      nameSpan.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${child.color || "#005ecb"}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>${child.name}`;

      const removeBtn = document.createElement("button");
      removeBtn.innerText = "Remove";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.padding = "4px 8px";
      removeBtn.style.fontSize = "12px";
      removeBtn.style.background = "#ff3b30";
      removeBtn.style.color = "#fff";
      removeBtn.style.border = "none";
      removeBtn.style.borderRadius = "6px";
      removeBtn.style.fontWeight = "500";
      removeBtn.onclick = () => settingsViewModel.removeChild(child.id);

      li.appendChild(nameSpan);
      li.appendChild(removeBtn);
      childrenList.appendChild(li);
    });
  }, true);

  if (addChildBtn) {
    addChildBtn.addEventListener("click", () => {
      if (!newChildInput || !newChildInput.value.trim()) return;
      const color = newChildColor ? newChildColor.value : "#ff3b30";
      settingsViewModel.addChild(newChildInput.value.trim(), color);
      newChildInput.value = "";
    });
  }
}
