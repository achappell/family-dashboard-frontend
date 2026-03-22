export function setupTabs() {
  const tabCalendar = document.getElementById("tab-calendar");
  const tabChores = document.getElementById("tab-chores");
  const tabSettings = document.getElementById("tab-settings");
  const tabContentCalendar = document.getElementById("tab-content-calendar");
  const tabContentChores = document.getElementById("tab-content-chores");
  const tabContentSettings = document.getElementById("tab-content-settings");

  if (
    tabCalendar &&
    tabChores &&
    tabSettings &&
    tabContentCalendar &&
    tabContentChores &&
    tabContentSettings
  ) {
    tabCalendar.addEventListener("click", () => {
      tabCalendar.style.background = "#eee";
      tabCalendar.style.fontWeight = "bold";
      tabChores.style.background = "transparent";
      tabChores.style.fontWeight = "normal";
      tabSettings.style.background = "transparent";
      tabSettings.style.fontWeight = "normal";
      tabContentCalendar.style.display = "flex";
      tabContentChores.style.display = "none";
      tabContentSettings.style.display = "none";
    });

    tabChores.addEventListener("click", () => {
      tabChores.style.background = "#eee";
      tabChores.style.fontWeight = "bold";
      tabCalendar.style.background = "transparent";
      tabCalendar.style.fontWeight = "normal";
      tabSettings.style.background = "transparent";
      tabSettings.style.fontWeight = "normal";
      tabContentChores.style.display = "flex";
      tabContentCalendar.style.display = "none";
      tabContentSettings.style.display = "none";
    });

    tabSettings.addEventListener("click", () => {
      tabSettings.style.background = "#eee";
      tabSettings.style.fontWeight = "bold";
      tabCalendar.style.background = "transparent";
      tabCalendar.style.fontWeight = "normal";
      tabChores.style.background = "transparent";
      tabChores.style.fontWeight = "normal";
      tabContentSettings.style.display = "flex";
      tabContentCalendar.style.display = "none";
      tabContentChores.style.display = "none";
    });
  }
}
