import { choresViewModel } from "../viewmodels/ChoresViewModel";

export function setupChoresUI() {
  const container = document.getElementById("chore-chart-container");
  if (!container) return;

  choresViewModel.children.subscribe((children) => {
    container.innerHTML = "";
    if (children.length === 0) {
      container.innerHTML =
        "<p style='color: #666;'>Add children to see the chore chart.</p>";
      return;
    }

    children.forEach((child) => {
      const col = document.createElement("div");
      col.style.flex = "1";
      col.style.minWidth = "220px";
      col.style.border = "1px solid #e5e5ea";
      col.style.borderTop = `6px solid ${child.color || "#ccc"}`;
      col.style.borderRadius = "12px";
      col.style.padding = "20px";
      col.style.background = "#fff";
      col.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";

      const header = document.createElement("h3");
      header.style.margin = "0 0 16px 0";
      header.style.textAlign = "center";
      header.style.fontSize = "18px";
      header.style.color = "#1d1d1f";
      header.innerText = child.name;

      const choreList = document.createElement("div");
      choreList.innerHTML =
        "<p style='color: #999; text-align: center; font-size: 14px;'>No chores assigned</p>";

      col.appendChild(header);
      col.appendChild(choreList);
      container.appendChild(col);
    });
  }, true);
}
