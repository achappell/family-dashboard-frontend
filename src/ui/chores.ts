import { choresViewModel } from "../viewmodels/ChoresViewModel";

let selectedDays: Set<number> = new Set();
let choreFilterMode: 'today' | 'all' = 'today';

export function setupChoresUI() {
  const container = document.getElementById("chore-chart-container");
  if (!container) return;

  // Add Filter Toggle at the top
  let toolbar = document.getElementById('chores-toolbar');
  if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'chores-toolbar';
      toolbar.style.width = '100%';
      toolbar.style.display = 'flex';
      toolbar.style.justifyContent = 'center';
      toolbar.style.marginBottom = '30px';
      
      toolbar.innerHTML = `
        <div style="background: #e5e5ea; padding: 4px; border-radius: 12px; display: flex; gap: 4px;">
            <button id="filter-today" style="padding: 8px 24px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">Today</button>
            <button id="filter-all" style="padding: 8px 24px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; background: transparent; color: #666;">All</button>
        </div>
      `;
      container.parentElement.insertBefore(toolbar, container);

      const btnToday = document.getElementById('filter-today');
      const btnAll = document.getElementById('filter-all');

      const setMode = (mode: 'today' | 'all') => {
          choreFilterMode = mode;
          btnToday.style.background = mode === 'today' ? 'white' : 'transparent';
          btnToday.style.boxShadow = mode === 'today' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none';
          btnToday.style.color = mode === 'today' ? '#000' : '#666';

          btnAll.style.background = mode === 'all' ? 'white' : 'transparent';
          btnAll.style.boxShadow = mode === 'all' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none';
          btnAll.style.color = mode === 'all' ? '#000' : '#666';
          
          renderChores(container);
      };

      btnToday.onclick = () => setMode('today');
      btnAll.onclick = () => setMode('all');
      setMode('today');
  }

  // Initialize data fetch
  choresViewModel.fetchParticipants();
  choresViewModel.fetchChores();

  choresViewModel.chores.subscribe(() => {
    renderChores(container);
  });

  choresViewModel.participants.subscribe(() => {
    renderChores(container);
  }, true);

  setupAddChoreModal();
}

function setupAddChoreModal() {
    if (document.getElementById('add-chore-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'add-chore-modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1000';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 20px; width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <h2 style="margin-top: 0; margin-bottom: 20px;">New Chore</h2>
            
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666;">TITLE</label>
                    <input id="modal-chore-title" type="text" placeholder="e.g. Clean room" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                </div>

                <div>
                    <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666;">DESCRIPTION</label>
                    <textarea id="modal-chore-desc" placeholder="Details..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; height: 80px; box-sizing: border-box;"></textarea>
                </div>

                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666;">ASSIGN TO</label>
                        <select id="modal-chore-child" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: white;">
                            <option value="">Unassigned</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666;">DUE DATE</label>
                        <input id="modal-chore-date" type="date" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666;">RECURRENCE</label>
                    <select id="modal-chore-recurrence" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: white;">
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div id="modal-weekly-days" style="display: none;">
                    <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #666;">REPEAT ON</label>
                    <div style="display: flex; gap: 8px;">
                        ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => `
                            <button class="day-btn" data-day="${i}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ddd; background: #f5f5f7; cursor: pointer; font-size: 11px; font-weight: bold;">${day}</button>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button id="modal-cancel" style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #ddd; background: #f5f5f7; cursor: pointer; font-weight: 600;">Cancel</button>
                    <button id="modal-save" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #007aff; color: white; cursor: pointer; font-weight: 600;">Add Chore</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const recurrenceSelect = document.getElementById('modal-chore-recurrence') as HTMLSelectElement;
    const weeklyDays = document.getElementById('modal-weekly-days');
    
    recurrenceSelect.onchange = () => {
        weeklyDays.style.display = recurrenceSelect.value === 'weekly' ? 'block' : 'none';
    };

    const dayBtns = modal.querySelectorAll('.day-btn');
    dayBtns.forEach(btn => {
        (btn as HTMLElement).onclick = () => {
            const day = parseInt((btn as HTMLElement).dataset.day);
            if (selectedDays.has(day)) {
                selectedDays.delete(day);
                (btn as HTMLElement).style.background = '#f5f5f7';
                (btn as HTMLElement).style.color = '#000';
                (btn as HTMLElement).style.borderColor = '#ddd';
            } else {
                selectedDays.add(day);
                (btn as HTMLElement).style.background = '#007aff';
                (btn as HTMLElement).style.color = '#fff';
                (btn as HTMLElement).style.borderColor = '#007aff';
            }
        };
    });

    const closeModal = () => { 
        modal.style.display = 'none'; 
        selectedDays.clear();
        dayBtns.forEach(btn => {
            (btn as HTMLElement).style.background = '#f5f5f7';
            (btn as HTMLElement).style.color = '#000';
            (btn as HTMLElement).style.borderColor = '#ddd';
        });
    };
    
    document.getElementById('modal-cancel').onclick = closeModal;
    
    document.getElementById('modal-save').onclick = () => {
        const title = (document.getElementById('modal-chore-title') as HTMLInputElement).value;
        const description = (document.getElementById('modal-chore-desc') as HTMLTextAreaElement).value;
        const participant_id = (document.getElementById('modal-chore-child') as HTMLSelectElement).value;
        const due_date = (document.getElementById('modal-chore-date') as HTMLInputElement).value;
        const recurrence = (document.getElementById('modal-chore-recurrence') as HTMLSelectElement).value;

        if (title) {
            const recurring_days = recurrence === 'weekly' ? Array.from(selectedDays).sort((a,b) => a-b) : [];
            choresViewModel.addChore({
                title,
                description: description || undefined,
                participant_id: participant_id || undefined,
                due_date: due_date || undefined,
                recurrence,
                recurring_days
            });
            closeModal();
            // Clear inputs
            (document.getElementById('modal-chore-title') as HTMLInputElement).value = '';
            (document.getElementById('modal-chore-desc') as HTMLTextAreaElement).value = '';
        }
    };
}

function showAddChoreModal(participantId?: string) {
    const modal = document.getElementById('add-chore-modal');
    if (!modal) return;

    // Refresh participant list in select
    const select = document.getElementById('modal-chore-child') as HTMLSelectElement;
    const currentVal = select.value;
    select.innerHTML = '<option value="">Unassigned</option>';
    choresViewModel.participants.value.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.text = p.name;
        select.appendChild(opt);
    });

    if (participantId) select.value = participantId;
    else select.value = currentVal;

    // Set default date to today
    const dateInput = document.getElementById('modal-chore-date') as HTMLInputElement;
    if (!dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    modal.style.display = 'flex';
}

function renderChores(container: HTMLElement) {
  const participants = choresViewModel.participants.value;
  const chores = choresViewModel.chores.value;
  console.log("Rendering chores for participants:", participants);

  container.innerHTML = "";
  if (participants.length === 0) {
    container.innerHTML =
      "<p style='color: #666;'>Add children or invite family members to see the chore chart.</p>";
    return;
  }

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  participants.forEach((participant) => {
    const col = document.createElement("div");
    col.style.flex = "1";
    col.style.minWidth = "320px";
    col.style.maxWidth = "400px";
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.gap = "20px";
    col.style.padding = "24px";
    col.style.background = "#f8f9fa";
    col.style.border = "1px solid #e5e5ea";
    col.style.borderTop = `8px solid ${participant.color || "#8e8e93"}`;
    col.style.borderRadius = "20px";
    col.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";

    const header = document.createElement("h3");
    header.style.margin = "0";
    header.style.textAlign = "center";
    header.style.fontSize = "22px";
    header.style.fontWeight = "800";
    header.style.color = "#1d1d1f";
    header.innerText = participant.name;

    const addBtn = document.createElement("button");
    addBtn.innerText = "+ Add Chore";
    addBtn.style.padding = "10px";
    addBtn.style.borderRadius = "12px";
    addBtn.style.border = "2px dashed #d1d1d6";
    addBtn.style.background = "transparent";
    addBtn.style.color = "#8e8e93";
    addBtn.style.cursor = "pointer";
    addBtn.style.fontWeight = "600";
    addBtn.style.fontSize = "14px";
    addBtn.onclick = () => showAddChoreModal(participant.id);

    const choreList = document.createElement("div");
    choreList.style.display = "flex";
    choreList.style.flexDirection = "column";
    choreList.style.gap = "12px";
    
    const participantChores = chores.filter(c => {
        if (choreFilterMode === 'today') {
            if (!c.dueDate) return false;
            const d = new Date(c.dueDate);
            d.setHours(0, 0, 0, 0);
            const isDueToday = d.getTime() === today.getTime();
            
            let isOverdueUncompleted = false;
            if (c.recurrence === 'none') {
                isOverdueUncompleted = d.getTime() < today.getTime() && !c.isCompleted;
            } else if (c.lastCompletedAt) {
                const last = new Date(c.lastCompletedAt);
                last.setHours(0,0,0,0);
                isOverdueUncompleted = d.getTime() < today.getTime() && last.getTime() < today.getTime();
            } else {
                isOverdueUncompleted = d.getTime() < today.getTime();
            }

            return (isDueToday || isOverdueUncompleted) && c.childId === participant.id;
        } else {
            return c.childId === participant.id;
        }
    });

    if (participantChores.length === 0) {
      choreList.innerHTML =
        `<p style='color: #999; text-align: center; font-size: 14px; padding: 40px 0; background: #fff; border-radius: 16px; border: 2px dashed #e5e5ea;'>${choreFilterMode === 'today' ? 'No chores due today! 🎉' : 'All caught up! 🎉'}</p>`;
    } else {
      participantChores.forEach(chore => {
        let isDone = false;
        if (chore.recurrence === 'none') {
            isDone = chore.isCompleted;
        } else if (chore.lastCompletedAt) {
            const last = new Date(chore.lastCompletedAt);
            last.setHours(0,0,0,0);
            isDone = last.getTime() === today.getTime();
        }

        const card = document.createElement("div");
        card.style.background = "#fff";
        card.style.padding = "20px";
        card.style.borderRadius = "16px";
        card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.gap = "8px";
        card.style.cursor = "pointer";
        card.style.transition = "transform 0.1s ease, box-shadow 0.1s ease";
        card.style.border = "1px solid rgba(0,0,0,0.02)";
        
        if (isDone) {
            card.style.opacity = "0.6";
            card.style.background = "#f9f9fb";
        }

        const topRow = document.createElement("div");
        topRow.style.display = "flex";
        topRow.style.alignItems = "center";
        topRow.style.justifyContent = "space-between";

        const title = document.createElement("span");
        title.innerText = chore.title;
        title.style.fontSize = "18px";
        title.style.fontWeight = "700";
        title.style.color = isDone ? "#8e8e93" : "#1d1d1f";
        title.style.textDecoration = isDone ? "line-through" : "none";

        const statusIcon = document.createElement("div");
        statusIcon.style.width = "24px";
        statusIcon.style.height = "24px";
        statusIcon.style.borderRadius = "50%";
        statusIcon.style.border = `2px solid ${isDone ? "#34c759" : "#e5e5ea"}`;
        statusIcon.style.background = isDone ? "#34c759" : "transparent";
        statusIcon.style.display = "flex";
        statusIcon.style.alignItems = "center";
        statusIcon.style.justifyContent = "center";
        statusIcon.innerHTML = isDone ? "<span style='color: white; font-size: 14px;'>✓</span>" : "";

        topRow.appendChild(title);
        topRow.appendChild(statusIcon);
        card.appendChild(topRow);

        if (chore.description) {
            const desc = document.createElement("span");
            desc.innerText = chore.description;
            desc.style.fontSize = "14px";
            desc.style.color = "#666";
            desc.style.lineHeight = "1.4";
            card.appendChild(desc);
        }

        const metaRow = document.createElement("div");
        metaRow.style.display = "flex";
        metaRow.style.flexWrap = "wrap";
        metaRow.style.gap = "8px";
        metaRow.style.marginTop = "4px";

        if (chore.dueDate) {
            const dateTag = document.createElement("span");
            dateTag.innerHTML = `📅 <span style="margin-left: 4px;">${chore.dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>`;
            dateTag.style.fontSize = "11px";
            dateTag.style.fontWeight = "600";
            dateTag.style.padding = "4px 10px";
            dateTag.style.borderRadius = "8px";
            
            const isOverdue = chore.dueDate < today && !isDone;
            dateTag.style.background = isOverdue ? "#ff3b301a" : "#f2f2f7";
            dateTag.style.color = isOverdue ? "#ff3b30" : "#8e8e93";
            metaRow.appendChild(dateTag);
        }

        if (chore.recurrence && chore.recurrence !== "none") {
            let recLabel = chore.recurrence.charAt(0).toUpperCase() + chore.recurrence.slice(1);
            if (chore.recurrence === 'weekly' && chore.recurringDays && chore.recurringDays.length > 0) {
                recLabel = chore.recurringDays.map(d => dayLetters[d]).join(',');
            }
            const recTag = document.createElement("span");
            recTag.innerHTML = `🔄 <span style="margin-left: 4px;">${recLabel}</span>`;
            recTag.style.fontSize = "11px";
            recTag.style.fontWeight = "600";
            recTag.style.padding = "4px 10px";
            recTag.style.borderRadius = "8px";
            recTag.style.background = "#f2f2f7";
            recTag.style.color = "#8e8e93";
            metaRow.appendChild(recTag);
        }

        if (metaRow.children.length > 0) card.appendChild(metaRow);

        card.onclick = () => choresViewModel.toggleChore(chore);
        choreList.appendChild(card);
      });
    }

    col.appendChild(header);
    col.appendChild(addBtn);
    col.appendChild(choreList);
    container.appendChild(col);
  });
}
