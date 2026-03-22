import { calendarViewModel } from "../viewmodels/CalendarViewModel";
import { settingsViewModel } from "../viewmodels/SettingsViewModel";
import { CalendarEvent } from "../models";

export function setupCalendarUI() {
  const container = document.getElementById("calendar-settings-container");
  const calendarTabContent = document.getElementById("tab-content-calendar");
  if (!container || !calendarTabContent) return;

  container.innerHTML = "";
  const select = document.createElement("select");
  select.id = "calendarSelect";
  select.style.cssText =
    "padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e5ea; font-size: 14px; outline: none; background: #fafafa; min-width: 200px;";
  container.appendChild(select);

  calendarViewModel.calendars.subscribe((calendars) => {
    select.innerHTML = "";
    calendars.forEach((cal) => {
      const option = document.createElement("option");
      option.value = cal.id;
      option.text = cal.summary || "Unnamed Calendar";
      select.appendChild(option);
    });
    select.value = calendarViewModel.selectedCalendarId.value;
  }, true);

  select.onchange = () => {
    calendarViewModel.selectedCalendarId.value = select.value;
  };

  let eventsContainer = document.getElementById("events-container");
  if (!eventsContainer) {
    eventsContainer = document.createElement("div");
    eventsContainer.id = "events-container";

    const headerWrapper = document.createElement("div");
    headerWrapper.style.display = "flex";
    headerWrapper.style.justifyContent = "space-between";
    headerWrapper.style.marginBottom = "10px";
    headerWrapper.style.flexShrink = "0";

    const navWrapper = document.createElement("div");
    navWrapper.style.display = "flex";
    navWrapper.style.alignItems = "center";
    navWrapper.style.gap = "10px";

    const btnStyle =
      "padding: 6px 12px; cursor: pointer; border: 1px solid #e5e5ea; border-radius: 8px; background: #fff; font-weight: 500; font-size: 13px; color: #1d1d1f; box-shadow: 0 1px 2px rgba(0,0,0,0.03);";

    const prevBtn = document.createElement("button");
    prevBtn.innerText = "◀ Prev";
    prevBtn.innerHTML = "◀";
    prevBtn.style.cssText = btnStyle;
    prevBtn.onclick = () => calendarViewModel.previousWeek();

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next ▶";
    nextBtn.innerHTML = "▶";
    nextBtn.style.cssText = btnStyle;
    nextBtn.onclick = () => calendarViewModel.nextWeek();

    const dateLabel = document.createElement("span");
    dateLabel.id = "calendar-date-label";
    dateLabel.style.fontWeight = "bold";

    navWrapper.appendChild(prevBtn);
    navWrapper.appendChild(dateLabel);
    navWrapper.appendChild(nextBtn);

    const refreshBtn = document.createElement("button");
    refreshBtn.id = "calendar-refresh-btn";
    refreshBtn.innerHTML =
      "<span id='calendar-refresh-icon' style='display: inline-block;'>↻</span> Refresh";
    ("<span id='calendar-refresh-icon' style='display: inline-block;'>↻</span>");
    refreshBtn.style.cssText = btnStyle;
    refreshBtn.onclick = () => {
      calendarViewModel.fetchEvents(calendarViewModel.selectedCalendarId.value);
    };

    headerWrapper.appendChild(navWrapper);
    headerWrapper.appendChild(refreshBtn);
    eventsContainer.appendChild(headerWrapper);

    const grid = document.createElement("div");
    grid.id = "calendar-grid";
    grid.style.flex = "1";
    grid.style.display = "flex";
    grid.style.flexDirection = "column";
    grid.style.minHeight = "0";
    eventsContainer.appendChild(grid);

    calendarTabContent.appendChild(eventsContainer);
  }

  const calendarGrid = document.getElementById("calendar-grid");
  if (!calendarGrid) return;

  calendarViewModel.currentDate.subscribe((date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const label = document.getElementById("calendar-date-label");
    if (label)
      label.innerText = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }, true);

  calendarViewModel.isLoadingEvents.subscribe((isLoading) => {
    const refreshIcon = document.getElementById("calendar-refresh-icon");
    if (refreshIcon) {
      if (isLoading) refreshIcon.classList.add("spin");
      else refreshIcon.classList.remove("spin");
    }
  });

  if (!document.getElementById("weekly-cal-styles")) {
    const style = document.createElement("style");
    style.id = "weekly-cal-styles";
    style.innerHTML = `
      :root, #app, #root { max-width: none !important; width: 100%; padding: 0; margin: 0; text-align: left; background: #f4f5f7; color: #1d1d1f; }
      html, body { margin: 0; padding: 0; height: 100vh; width: 100%; max-width: none !important; overflow: hidden; background: #f4f5f7; }
      body { display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      #calendar-ui { flex-shrink: 0; width: 100%; }
      #events-container { flex: 1; display: flex; flex-direction: column; min-height: 0; margin-top: 5px; width: 100%; }
      .cal-container { display: flex; flex-direction: column; flex: 1; border: 1px solid #e5e5ea; overflow: hidden; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); box-sizing: border-box; width: 100%; }
      .cal-header { display: flex; border-bottom: 1px solid #e5e5ea; background: #fafafa; }
      .cal-header-tz { width: 60px; border-right: 1px solid #e5e5ea; flex-shrink: 0; }
      .cal-header-day { flex: 1; text-align: center; padding: 12px 0; border-right: 1px solid #e5e5ea; font-weight: 600; font-size: 13px; color: #1d1d1f; min-width: 0; box-sizing: border-box; }
      .cal-header-day:last-child { border-right: none; }
      .cal-body { display: flex; flex: 1; overflow-y: auto; scroll-behavior: smooth; }
      .cal-time-col { width: 60px; background: #fafafa; border-right: 1px solid #e5e5ea; flex-shrink: 0; min-height: 2880px; }
      .cal-time-slot { height: 120px; text-align: right; padding-right: 8px; font-size: 11px; color: #86868b; border-bottom: 1px solid transparent; box-sizing: border-box; transform: translateY(-7px); font-weight: 500; }
      .cal-day-col { flex: 1; border-right: 1px solid #e5e5ea; position: relative; background: linear-gradient(to bottom, transparent 119px, #f0f0f5 120px); background-size: 100% 120px; min-width: 0; box-sizing: border-box; min-height: 2880px; }
      .cal-day-col:last-child { border-right: none; }
      .cal-event { position: absolute; left: 2px; right: 2px; background: rgba(10, 132, 255, 0.9); color: #fff; border-radius: 6px; padding: 4px 6px; font-size: 11px; overflow: hidden; box-sizing: border-box; border-left: 3px solid #005ecb; cursor: default; z-index: 10; transition: transform 0.1s ease, box-shadow 0.1s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .cal-event:hover { z-index: 20; transform: scale(1.01); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
      .cal-event-title { font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 12px; }
      .cal-event-time { font-size: 10px; opacity: 0.9; margin-top: 2px; }
      .cal-current-time { position: absolute; left: 0; right: 0; height: 2px; background-color: #ff3b30; z-index: 50; pointer-events: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .cal-current-time::before { content: ''; position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; background-color: #ff3b30; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  calendarViewModel.events.subscribe((events) => {
    renderEventsGrid(calendarGrid, events);
  });

  // Repaint calendar if children details (like colors) are updated
  settingsViewModel.children.subscribe(() => {
    renderEventsGrid(calendarGrid, calendarViewModel.events.value);
  });

  if ((window as any).calendarRefreshInterval)
    clearInterval((window as any).calendarRefreshInterval);
  (window as any).calendarRefreshInterval = setInterval(() => {
    calendarViewModel.fetchEvents(calendarViewModel.selectedCalendarId.value);
  }, 900000);
}

function renderEventsGrid(calendarGrid: HTMLElement, events: CalendarEvent[]) {
  const children = settingsViewModel.children.value;

  const now = calendarViewModel.currentDate.value;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  let headerHTML = `<div class="cal-header"><div class="cal-header-tz"></div>`;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    headerHTML += `<div class="cal-header-day" id="cal-header-day-${i}">${dayNames[i]} ${d.getDate()}</div>`;
  }
  headerHTML += `</div>`;

  let timeSlotsHTML = `<div class="cal-time-col">`;
  for (let i = 0; i < 24; i++) {
    const displayHour =
      i === 0
        ? "12 AM"
        : i < 12
          ? `${i} AM`
          : i === 12
            ? "12 PM"
            : `${i - 12} PM`;
    timeSlotsHTML += `<div class="cal-time-slot">${displayHour}</div>`;
  }
  timeSlotsHTML += `</div>`;

  let dayColsHTML = "";
  for (let i = 0; i < 7; i++) {
    dayColsHTML += `<div class="cal-day-col" id="cal-day-${i}"></div>`;
  }

  const isFirstRender = !document.querySelector(".cal-container");
  if (isFirstRender) {
    calendarGrid.innerHTML = `<div class="cal-container">${headerHTML}<div class="cal-body">${timeSlotsHTML}${dayColsHTML}</div></div>`;
  } else {
    // Update dates in header if week changed while app was open
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const headerDay = document.getElementById(`cal-header-day-${i}`);
      if (headerDay) headerDay.innerText = `${dayNames[i]} ${d.getDate()}`;
    }
  }

  const allDayCounts = [0, 0, 0, 0, 0, 0, 0];
  const currentEventIds = new Set();

  events.forEach((event) => {
    const eventId = `cal-event-${event.id}`;
    currentEventIds.add(eventId);

    const isAllDay = event.isAllDay;
    const start = event.start;
    const end = event.end;
    const dayIndex = start.getDay();
    const dayCol = document.getElementById(`cal-day-${dayIndex}`);
    if (!dayCol) return;

    let eventEl = document.getElementById(eventId);
    if (!eventEl) {
      eventEl = document.createElement("div");
      eventEl.id = eventId;
      eventEl.className = "cal-event";
    }

    const summary = event.summary;
    let bgColor = isAllDay
      ? "rgba(52, 199, 89, 0.9)"
      : "rgba(10, 132, 255, 0.9)";
    let borderColor = isAllDay ? "#248a3d" : "#005ecb";

    for (const child of children) {
      if (
        child.name &&
        summary.toLowerCase().includes(child.name.toLowerCase())
      ) {
        if (child.color) {
          borderColor = child.color;
          bgColor = child.color + "E6"; // ~90% opacity to the hex color for vibrant pills
        }
        break; // Stop at first matched child
      }
    }

    if (isAllDay) {
      const count = allDayCounts[dayIndex];
      eventEl.style.position = "sticky";
      eventEl.style.top = `${count * 27}px`;
      eventEl.style.zIndex = "40"; // Float above normal events
      eventEl.style.height = "25px";
      eventEl.style.width = "calc(100% - 4px)";
      eventEl.style.left = "auto";
      eventEl.style.right = "auto";
      eventEl.style.margin = "0 2px 2px 2px";
      eventEl.style.background = bgColor;
      eventEl.style.borderLeftColor = borderColor;
      eventEl.innerHTML = `<div class="cal-event-title">${summary}</div>`;
      allDayCounts[dayIndex]++;
    } else {
      const top = (start.getHours() * 60 + start.getMinutes()) * 2; // 2 pixels per minute
      let height = ((end.getTime() - start.getTime()) / (1000 * 60)) * 2;
      const maxDayHeight = 24 * 60 * 2 - top;
      if (height > maxDayHeight) height = maxDayHeight;
      if (height < 30) height = 30; // Minimum 30px height (15 mins visual space) so text is always readable

      eventEl.style.top = `${top}px`;
      eventEl.style.height = `${height}px`;
      eventEl.style.position = "absolute";
      eventEl.style.width = "";
      eventEl.style.left = "2px";
      eventEl.style.right = "2px";
      eventEl.style.margin = "";
      eventEl.style.zIndex = "10";
      eventEl.style.background = bgColor;
      eventEl.style.borderLeftColor = borderColor;

      const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      eventEl.innerHTML = `<div class="cal-event-title">${summary}</div><div class="cal-event-time">${formatTime(start)} - ${formatTime(end)}</div>`;
    }

    if (eventEl.parentElement !== dayCol) {
      dayCol.appendChild(eventEl);
    }
  });

  // Clean up old events that were deleted from Google
  document.querySelectorAll(".cal-event").forEach((el) => {
    if (!currentEventIds.has(el.id)) {
      el.remove();
    }
  });

  const updateCurrentTimeLine = () => {
    let lineEl = document.getElementById("current-time-line");

    const timeNow = new Date();
    const displayedDate = calendarViewModel.currentDate.value;

    const startOfDisplayedWeek = new Date(displayedDate);
    startOfDisplayedWeek.setDate(
      startOfDisplayedWeek.getDate() - startOfDisplayedWeek.getDay(),
    );
    startOfDisplayedWeek.setHours(0, 0, 0, 0);

    const endOfDisplayedWeek = new Date(startOfDisplayedWeek);
    endOfDisplayedWeek.setDate(endOfDisplayedWeek.getDate() + 7);

    if (timeNow < startOfDisplayedWeek || timeNow >= endOfDisplayedWeek) {
      if (lineEl) lineEl.remove();
      return undefined;
    }

    const dayIndex = timeNow.getDay();
    const dayCol = document.getElementById(`cal-day-${dayIndex}`);
    if (!dayCol) return undefined;

    const top = (timeNow.getHours() * 60 + timeNow.getMinutes()) * 2;

    if (!lineEl) {
      lineEl = document.createElement("div");
      lineEl.id = "current-time-line";
      lineEl.className = "cal-current-time";
    }

    lineEl.style.top = `${top}px`;

    if (lineEl.parentElement !== dayCol) {
      dayCol.appendChild(lineEl);
    }
    return top;
  };

  const centerScroll = () => {
    const top = updateCurrentTimeLine();
    if (top !== undefined) {
      const calBody = document.querySelector(".cal-body") as HTMLElement;
      if (calBody) calBody.scrollTop = top - calBody.clientHeight / 2;
    }
  };

  updateCurrentTimeLine();

  if (isFirstRender) {
    centerScroll();
  }

  if ((window as any).currentTimeInterval) {
    clearInterval((window as any).currentTimeInterval);
  }
  (window as any).currentTimeInterval = setInterval(
    updateCurrentTimeLine,
    60000,
  );
}
