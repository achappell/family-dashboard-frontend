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
    const activeStyle = {
      background: "#fff",
      color: "#1d1d1f",
      fontWeight: "600",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    };
    const inactiveStyle = {
      background: "transparent",
      color: "#555",
      fontWeight: "500",
      boxShadow: "none",
    };

    tabCalendar.addEventListener("click", () => {
      Object.assign(tabCalendar.style, activeStyle);
      Object.assign(tabChores.style, inactiveStyle);
      Object.assign(tabSettings.style, inactiveStyle);

      tabContentCalendar.style.display = "flex";
      tabContentChores.style.display = "none";
      tabContentSettings.style.display = "none";
    });

    tabChores.addEventListener("click", () => {
      Object.assign(tabChores.style, activeStyle);
      Object.assign(tabCalendar.style, inactiveStyle);
      Object.assign(tabSettings.style, inactiveStyle);

      tabContentChores.style.display = "flex";
      tabContentCalendar.style.display = "none";
      tabContentSettings.style.display = "none";
    });

    tabSettings.addEventListener("click", () => {
      Object.assign(tabSettings.style, activeStyle);
      Object.assign(tabCalendar.style, inactiveStyle);
      Object.assign(tabChores.style, inactiveStyle);

      tabContentSettings.style.display = "flex";
      tabContentCalendar.style.display = "none";
      tabContentChores.style.display = "none";
    });
  }
}
