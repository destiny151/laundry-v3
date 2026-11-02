const STORAGE_KEY = 'laundry-room-v1';
const DEFAULT_HELPER = 'size';
const DEFAULT_USER = 'Keza, Flat 3B';

const clothesGuide = {
  cotton: { label: 'Cotton clothes', temp: 60, note: 'Good for towels, bedding and everyday cotton.' },
  synthetics: { label: 'Synthetics', temp: 40, note: 'Best for gym kits, blends and bright colours.' },
  delicates: { label: 'Delicates', temp: 30, note: 'Gentle wash for wool, silk and lace.' },
};

const machineCatalog = [
  { id: 'washer-1', name: 'Washer 1', sizeKg: 5, type: 'washer', status: 'free', summary: 'Ready to use' },
  { id: 'washer-2', name: 'Washer 2', sizeKg: 7, type: 'washer', status: 'free', summary: 'Ready to use' },
  { id: 'washer-3', name: 'Washer 3', sizeKg: 7, type: 'washer', status: 'in_use', remainingMinutes: 12 },
  { id: 'washer-4', name: 'Washer 4', sizeKg: 17, type: 'washer', status: 'in_use', remainingMinutes: 7 },
  { id: 'washer-5', name: 'Washer 5', sizeKg: 7, type: 'washer', status: 'finished', finishedMinutesAgo: 8, summary: 'Finished – waiting for Flat 2A to collect' },
  { id: 'washer-6', name: 'Washer 6', sizeKg: 17, type: 'washer', status: 'broken', summary: 'Broken' },
  { id: 'dryer-1', name: 'Dryer 1', sizeKg: 5, type: 'dryer', status: 'free', summary: 'Ready to use' },
  { id: 'dryer-2', name: 'Dryer 2', sizeKg: 7, type: 'dryer', status: 'finished', finishedMinutesAgo: 8, summary: 'Finished – waiting for Flat 5D to collect' },
];

const sampleBookings = [
  {
    id: 'sample-booking-1',
    machineId: 'washer-5',
    date: getDateInDays(0),
    time: getRecentPastTime(8),
    clothesType: 'cotton',
    owner: 'Flat 2A',
    createdAt: Date.now(),
    status: 'done',
  },
  {
    id: 'sample-booking-2',
    machineId: 'dryer-2',
    date: getDateInDays(0),
    time: getRecentPastTime(8),
    clothesType: 'delicates',
    owner: 'Flat 5D',
    createdAt: Date.now() - 1000 * 60 * 5,
    status: 'done',
  },
  {
    id: 'sample-booking-3',
    machineId: 'washer-3',
    date: getDateInDays(0),
    time: getCurrentLocalTimeValue(),
    clothesType: 'cotton',
    owner: DEFAULT_USER,
    createdAt: Date.now(),
    status: 'scheduled',
  },
  {
    id: 'sample-booking-4',
    machineId: 'washer-4',
    date: getDateInDays(0),
    time: getCurrentLocalTimeValue(),
    clothesType: 'synthetics',
    owner: 'Flat 4E',
    createdAt: Date.now() - 1000 * 60 * 10,
    status: 'scheduled',
  },
  {
    id: 'sample-booking-5',
    machineId: 'washer-3',
    date: getDateInDays(0),
    time: getCurrentLocalTimeValue(),
    clothesType: 'delicates',
    owner: 'Flat 2A',
    createdAt: Date.now() - 1000 * 60 * 15,
    status: 'scheduled',
  },
  {
    id: 'sample-booking-6',
    machineId: 'washer-4',
    date: getDateInDays(0),
    time: getCurrentLocalTimeValue(),
    clothesType: 'delicates',
    owner: 'Flat 4E',
    createdAt: Date.now() - 1000 * 60 * 10,
    status: 'scheduled',
  },
];

const state = {
  helper: DEFAULT_HELPER,
  selectedMachineId: null,
  selectedClothesType: 'cotton',
  activeMachineType: null,
  compactBooking: false,
  bookings: [],
  userName: DEFAULT_USER,
  confirmationBooking: null,
};

function getDateInDays(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatRelativeTimeFromMinutes(totalMinutes) {
  const minutes = Math.max(1, Math.round(totalMinutes));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) {
    return 'yesterday';
  }

  return `${days} d ago`;
}

function getRecentPastTime(minutesAgo) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getCurrentLocalTimeValue() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function getStoredUserName() {
  const saved = safeLoad();
  if (saved && typeof saved.userName === 'string' && saved.userName.trim()) {
    return saved.userName;
  }
  return DEFAULT_USER;
}

function initialiseStorage() {
  const existing = safeLoad();
  const today = getDateInDays(0);
  const hasTodayBookings = Array.isArray(existing?.bookings) && existing.bookings.some((booking) => booking.date === today);

  if (existing && Array.isArray(existing.machines) && Array.isArray(existing.bookings) && hasTodayBookings) {
    state.bookings = existing.bookings;
    state.userName = getStoredUserName();
    return existing.machines;
  }

  state.bookings = sampleBookings;
  state.userName = DEFAULT_USER;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines: machineCatalog, bookings: sampleBookings, userName: DEFAULT_USER }));
  return machineCatalog;
}

function getMachines() {
  const saved = safeLoad();
  if (saved && Array.isArray(saved.machines)) {
    return saved.machines;
  }
  return initialiseStorage();
}

function persistMachines(machines) {
  const saved = safeLoad();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    machines,
    bookings: saved ? saved.bookings : state.bookings,
    userName: state.userName || DEFAULT_USER,
  }));
}

function getMachineStatusLabel(machine) {
  if (!machine) {
    return 'Ready';
  }
  if (machine.status === 'free') {
    return 'Free';
  }
  if (machine.status === 'in_use') {
    return 'In use';
  }
  if (machine.status === 'finished') {
    return 'Finished';
  }
  if (machine.status === 'broken') {
    return 'Broken';
  }
  return 'Ready';
}

function getMachineOwner(machineId) {
  const booking = state.bookings
    .filter((entry) => entry.machineId === machineId && (entry.status === 'scheduled' || entry.status === 'done'))
    .sort((left, right) => new Date(`${left.date}T${left.time}:00`).getTime() - new Date(`${right.date}T${right.time}:00`).getTime())
    .at(-1);

  if (!booking) {
    return null;
  }

  return booking.owner || null;
}

function isCurrentUserOwner(owner) {
  if (!owner) {
    return false;
  }

  return owner.trim().toLowerCase() === (state.userName || DEFAULT_USER).trim().toLowerCase();
}

function getOwnerBadge(owner, machine) {
  if (!owner) {
    return machine && machine.status !== 'free' ? 'Not available' : 'Available';
  }

  return isCurrentUserOwner(owner) ? 'Yours' : `Booked by ${owner}`;
}

function getMachineCardStatusText(machine) {
  if (!machine) {
    return 'Ready';
  }

  if (machine.status === 'free') {
    return 'Free now';
  }

  if (machine.status === 'broken') {
    return '';
  }

  if (machine.status === 'in_use') {
    const remaining = Number(machine.remainingMinutes || 0);
    return remaining > 0 ? `Finishes in ${remaining} min` : 'In use';
  }

  if (machine.status === 'finished') {
    const owner = getMachineOwner(machine.id);
    if (owner) {
      const ownerName = isCurrentUserOwner(owner) ? 'you' : owner;
      return `Finished – waiting for ${ownerName} to collect`;
    }

    const minutesAgo = Number(machine.finishedMinutesAgo || machine.remainingMinutes || 0);
    if (minutesAgo > 0) {
      return `Finished ${formatRelativeTimeFromMinutes(minutesAgo)}`;
    }
    return 'Finished – waiting for collection';
  }

  return machine.summary || 'Ready';
}

function getRelativeStatus(machine) {
  return getMachineCardStatusText(machine);
}

function formatTime(value) {
  if (!value) return '—';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

function ensureBookingState() {
  const now = Date.now();
  state.bookings = (safeLoad()?.bookings || sampleBookings).map((booking) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const started = bookingDateTime.getTime() <= now;
    const elapsedMinutes = started ? (now - bookingDateTime.getTime()) / 60000 : 0;
    const isDone = booking.status === 'done' || (started && elapsedMinutes >= 60);

    return {
      ...booking,
      status: isDone ? 'done' : 'scheduled',
    };
  });
}

function syncMachineStateFromBookings() {
  const machines = getMachines();
  const now = Date.now();

  machines.forEach((machine) => {
    if (machine.status === 'broken') {
      return;
    }

    const relevantBooking = state.bookings
      .filter((entry) => entry.machineId === machine.id && (entry.status === 'scheduled' || entry.status === 'done'))
      .sort((left, right) => new Date(`${left.date}T${left.time}:00`).getTime() - new Date(`${right.date}T${right.time}:00`).getTime())
      .at(-1);

    if (!relevantBooking) {
      if (machine.status === 'finished' || machine.status === 'in_use') {
        machine.status = 'free';
        machine.summary = 'Ready to use';
        machine.remainingMinutes = 0;
        delete machine.finishedMinutesAgo;
      }
      return;
    }

    const bookingDateTime = new Date(`${relevantBooking.date}T${relevantBooking.time}:00`).getTime();
    const elapsedMinutes = (now - bookingDateTime) / 60000;
    const isDoneBooking = relevantBooking.status === 'done' || elapsedMinutes >= 60;

    if (isDoneBooking) {
      machine.status = 'finished';
      machine.summary = `Finished – waiting for ${relevantBooking.owner} to collect`;
      machine.remainingMinutes = 0;
      machine.finishedMinutesAgo = Math.max(1, Math.round(elapsedMinutes));
      return;
    }

    if (bookingDateTime <= now) {
      machine.status = 'in_use';
      machine.summary = 'Booked';
      machine.remainingMinutes = Math.max(1, 60 - Math.floor(elapsedMinutes));
      delete machine.finishedMinutesAgo;
      return;
    }

    machine.status = 'free';
    machine.summary = 'Ready to use';
    machine.remainingMinutes = 0;
    delete machine.finishedMinutesAgo;
  });

  persistMachines(machines);
}

function saveState() {
  const machines = getMachines();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    machines,
    bookings: state.bookings,
    userName: state.userName || DEFAULT_USER,
  }));
}

function getMachineTypeSummary(type) {
  const machines = getMachines().filter((machine) => machine.type === type);
  const counts = { free: 0, in_use: 0, finished: 0, broken: 0 };

  machines.forEach((machine) => {
    if (counts[machine.status] !== undefined) {
      counts[machine.status] += 1;
    }
  });

  return Object.entries({ free: 'free', in_use: 'in use', finished: 'finished', broken: 'broken' })
    .filter(([status]) => counts[status])
    .map(([status, label]) => `<span class="machine-type-badge machine-type-badge--${status}" data-status="${status}">${counts[status]} ${label}</span>`)
    .join('') || '<span class="machine-type-badge machine-type-badge--free" data-status="free">0 free</span>';
}

function renderMachineGrid() {
  const grid = document.getElementById('machineGrid');
  const machines = getMachines();
  grid.innerHTML = '';

  if (!state.activeMachineType) {
    ['washer', 'dryer'].forEach((type) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'machine-type-button';
      button.dataset.machineType = type;
      button.innerHTML = `
        <span class="machine-type-title">${type === 'washer' ? 'Washers' : 'Dryers'}</span>
        <span class="machine-type-summary">${getMachineTypeSummary(type)}</span>
      `;

      button.addEventListener('click', () => {
        state.activeMachineType = type;
        renderMachineGrid();
      });

      grid.appendChild(button);
    });

    return;
  }

  const visibleMachines = machines.filter((machine) => machine.type === state.activeMachineType);
  const title = state.activeMachineType === 'washer' ? 'Washers' : 'Dryers';

  const header = document.createElement('div');
  header.className = 'machine-list-header';
  header.innerHTML = `
    <button class="secondary-button" type="button" data-back-to-home>Back</button>
    <span class="machine-list-title">${title}</span>
  `;
  grid.appendChild(header);

  const backButton = header.querySelector('[data-back-to-home]');
  backButton.addEventListener('click', () => {
    state.activeMachineType = null;
    renderMachineGrid();
  });

  visibleMachines.forEach((machine) => {
    const card = document.createElement('article');
    card.className = 'machine-card';
    card.dataset.status = machine.status;

    const statusText = getMachineCardStatusText(machine);
    const machineStatus = getMachineStatusLabel(machine);
    const owner = getMachineOwner(machine.id);
    const ownerLabel = getOwnerBadge(owner, machine);
    const bookButton = machine.status === 'free'
      ? '<button type="button" class="book-machine-button" data-book-machine="' + machine.id + '">Book</button>'
      : '';

    card.innerHTML = `
      <div class="machine-top">
        <span class="machine-name">${machine.name}</span>
        <span class="machine-size">${machine.sizeKg}kg</span>
      </div>
      <div class="machine-visual" aria-hidden="true"></div>
      <div class="machine-status">
        <span class="status-pill">${machineStatus}</span>
        ${statusText ? `<span class="machine-info">${statusText}</span>` : ''}
      </div>
      <div class="machine-owner ${isCurrentUserOwner(owner) ? 'is-mine' : ''}">${ownerLabel}</div>
      ${bookButton}
    `;

    const bookButtonNode = card.querySelector('[data-book-machine]');
    if (bookButtonNode) {
      bookButtonNode.addEventListener('click', (event) => {
        event.stopPropagation();
        openBookingModal(machine.id);
      });
    }

    card.addEventListener('click', () => {
      if (machine.status !== 'free') {
        return;
      }
      openBookingModal(machine.id);
    });

    grid.appendChild(card);
  });
}

function renderHelperPanel() {
  const content = document.getElementById('helperContent');
  const helper = state.helper;

  document.querySelectorAll('.helper-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.helper === helper);
  });

  if (helper === 'size') {
    content.innerHTML = `
      <div class="helper-list">
        <div class="helper-item">
          <strong>Small load</strong>
          <small>Best for 5 kg machines. Good for a few clothes or a light wash.</small>
        </div>
        <div class="helper-item">
          <strong>Medium load</strong>
          <small>Use a 7 kg machine for a standard week of clothes or bedding.</small>
        </div>
        <div class="helper-item">
          <strong>Large load</strong>
          <small>Pick a 17 kg machine for blankets, towels and big family loads.</small>
        </div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="helper-list">
      ${Object.entries(clothesGuide)
        .map(
          ([key, value]) => `
            <div class="helper-item">
              <strong>${value.label}</strong>
              <small>${value.temp}°C — ${value.note}</small>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderMyMachines() {
  const container = document.getElementById('myMachinesSection');
  const list = document.getElementById('myMachinesList');
  const myBookings = state.bookings.filter((booking) => isCurrentUserOwner(booking.owner) && (booking.status === 'scheduled' || booking.status === 'done'));

  if (!myBookings.length) {
    container.classList.remove('visible');
    list.innerHTML = '';
    return;
  }

  container.classList.add('visible');
  const items = myBookings
    .map((booking) => {
      const machine = getMachines().find((current) => current.id === booking.machineId);
      const statusText = machine ? getMachineCardStatusText(machine) : 'Machine unavailable';
      return `
        <li class="my-machine-item">
          <div>
            <strong>${machine ? machine.name : 'Machine'}</strong>
            <span>${statusText}</span>
          </div>
          <button type="button" class="small-cancel" data-cancel-booking="${booking.id}">Cancel</button>
        </li>
      `;
    })
    .join('');

  list.innerHTML = `<ul class="my-machines-list">${items}</ul>`;
  list.querySelectorAll('[data-cancel-booking]').forEach((button) => {
    button.addEventListener('click', () => cancelBooking(button.dataset.cancelBooking));
  });
}

function renderBookingSection() {
  const container = document.getElementById('bookingSection');
  container.classList.remove('visible');
  container.innerHTML = '';

  if (state.confirmationBooking) {
    const booking = state.confirmationBooking;
    const machine = getMachines().find((current) => current.id === booking.machineId);
    const clothes = clothesGuide[booking.clothesType] || clothesGuide.cotton;
    const detailList = `
      <div class="booking-detail-list">
        <div class="booking-detail-item"><span>Machine</span><strong>${machine ? machine.name : 'Machine'} · ${machine ? machine.sizeKg : ''}kg</strong></div>
        <div class="booking-detail-item"><span>Date</span><strong>${formatDate(booking.date)}</strong></div>
        <div class="booking-detail-item"><span>Time</span><strong>${formatTime(booking.time)}</strong></div>
        <div class="booking-detail-item"><span>Clothes</span><strong>${clothes.label}</strong></div>
        <div class="booking-detail-item"><span>Suggested temp</span><strong>${clothes.temp}°C</strong></div>
      </div>
    `;

    container.innerHTML = `
      <div class="booking-card">
        <div class="booking-header-row">
          <span class="booking-label">Booked</span>
        </div>
        <h2 class="booking-confirmation-title">✓ Booked!</h2>
        ${detailList}
        <p class="booking-confirmation-copy">We'll remind you when your washing is done.</p>
        <div class="booking-actions confirmation-actions">
          <button class="primary-button" type="button" id="doneConfirmationButton">Done</button>
          <button class="secondary-button" type="button" id="cancelConfirmationButton">Cancel booking</button>
        </div>
      </div>
    `;
    container.classList.add('visible');

    document.getElementById('doneConfirmationButton').addEventListener('click', () => {
      state.confirmationBooking = null;
      render();
    });

    document.getElementById('cancelConfirmationButton').addEventListener('click', () => {
      cancelBooking(booking.id);
      state.confirmationBooking = null;
    });
  }
}

function openBookingModal(machineId) {
  state.selectedMachineId = machineId;
  const modal = document.getElementById('bookingModal');
  const machineSelect = document.getElementById('machineSelect');
  const clothesOptions = document.getElementById('clothesOptions');
  const dateInput = document.getElementById('bookingDate');
  const timeInput = document.getElementById('bookingTime');
  const tempHelp = document.getElementById('temperatureHelp');
  const userNameInput = document.getElementById('userNameInput');
  const machine = getMachines().find((current) => current.id === machineId) || getMachines()[0];

  const freeMachines = getMachines().filter((current) => current.status === 'free');
  const selectedMachine = freeMachines.find((current) => current.id === machineId) || freeMachines[0];
  state.selectedMachineId = selectedMachine ? selectedMachine.id : null;

  userNameInput.value = state.userName || DEFAULT_USER;

  machineSelect.innerHTML = freeMachines
    .map(
      (current) => `
        <button class="choice-chip ${current.id === state.selectedMachineId ? 'selected' : ''}" type="button" data-machine-chip="${current.id}">
          ${current.name} · ${current.sizeKg}kg
        </button>
      `,
    )
    .join('');

  machineSelect.querySelectorAll('[data-machine-chip]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedMachineId = button.dataset.machineChip;
      openBookingModal(state.selectedMachineId);
    });
  });

  const date = getDateInDays(0);
  const currentTime = getCurrentLocalTimeValue();
  dateInput.value = date;
  timeInput.value = currentTime;

  const isWasher = machine && machine.type === 'washer';
  const clothesFieldGroup = document.getElementById('clothesOptions').closest('.field-group');
  const tempFieldGroup = document.getElementById('temperatureHelp').closest('.field-group');

  clothesFieldGroup.style.display = isWasher ? 'grid' : 'none';
  tempFieldGroup.style.display = isWasher ? 'grid' : 'none';

  if (!isWasher) {
    state.selectedClothesType = 'cotton';
    tempHelp.innerHTML = '';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    return;
  }

  clothesOptions.innerHTML = Object.entries(clothesGuide)
    .map(
      ([key, value]) => `
        <button class="choice-chip ${state.selectedClothesType === key ? 'selected' : ''}" type="button" data-clothes-chip="${key}">
          ${value.label}
        </button>
      `,
    )
    .join('');

  clothesOptions.querySelectorAll('[data-clothes-chip]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedClothesType = button.dataset.clothesChip;
      updateTemperatureSuggestion();
      renderClothesOptions();
    });
  });

  updateTemperatureSuggestion();
  renderClothesOptions();

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function renderClothesOptions() {
  const clothesOptions = document.getElementById('clothesOptions');
  clothesOptions.querySelectorAll('[data-clothes-chip]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.clothesChip === state.selectedClothesType);
  });
}

function updateTemperatureSuggestion() {
  const tempHelp = document.getElementById('temperatureHelp');
  const selected = clothesGuide[state.selectedClothesType] || clothesGuide.cotton;
  tempHelp.innerHTML = `${selected.label}: ${selected.temp}°C`;
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.add('hidden');
  document.getElementById('bookingModal').setAttribute('aria-hidden', 'true');
}

function confirmBooking() {
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;
  const userNameInput = document.getElementById('userNameInput');
  const enteredName = (userNameInput?.value || '').trim();

  if (!state.selectedMachineId || !date || !time) {
    return;
  }

  if (enteredName) {
    state.userName = enteredName;
  }

  const machine = getMachines().find((current) => current.id === state.selectedMachineId);
  const booking = {
    id: `booking-${Date.now()}`,
    machineId: state.selectedMachineId,
    date,
    time,
    clothesType: machine && machine.type === 'washer' ? state.selectedClothesType : 'cotton',
    owner: state.userName,
    createdAt: Date.now(),
    status: 'scheduled',
  };

  state.compactBooking = false;
  state.bookings.push(booking);
  state.confirmationBooking = booking;
  saveState();

  const machines = getMachines();
  const machineIndex = machines.findIndex((current) => current.id === state.selectedMachineId);
  if (machineIndex !== -1) {
    machines[machineIndex].status = 'in_use';
    machines[machineIndex].summary = 'Booked';
    machines[machineIndex].remainingMinutes = 45;
    persistMachines(machines);
  }

  closeBookingModal();
  render();
}

function cancelBooking(bookingId) {
  const bookingIndex = state.bookings.findIndex((booking) => booking.id === bookingId);
  if (bookingIndex !== -1) {
    const booking = state.bookings[bookingIndex];
    const machines = getMachines();
    const machine = machines.find((currentMachine) => currentMachine.id === booking.machineId);
    if (machine) {
      machine.status = 'free';
      machine.summary = 'Ready to use';
      machine.remainingMinutes = 0;
      delete machine.finishedMinutesAgo;
      persistMachines(machines);
    }
    state.bookings.splice(bookingIndex, 1);
    saveState();
    render();
  }
}

function attachEvents() {
  document.querySelectorAll('[data-book-type]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeMachineType = button.dataset.bookType;
      renderMachineGrid();
      const freeMachines = getMachines().filter((machine) => machine.type === button.dataset.bookType && machine.status === 'free');
      if (freeMachines.length) {
        openBookingModal(freeMachines[0].id);
      }
    });
  });

  document.getElementById('closeModalButton').addEventListener('click', closeBookingModal);
  document.getElementById('cancelBookingButton').addEventListener('click', closeBookingModal);
  document.getElementById('confirmBookingButton').addEventListener('click', confirmBooking);
  document.getElementById('refreshButton').addEventListener('click', () => {
    state.activeMachineType = null;
    render();
  });

  document.querySelectorAll('.helper-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.helper = button.dataset.helper;
      renderHelperPanel();
    });
  });
}

function render() {
  ensureBookingState();
  syncMachineStateFromBookings();
  renderMyMachines();
  renderMachineGrid();
  renderHelperPanel();
  renderBookingSection();
}

function bootstrap() {
  state.activeMachineType = null;
  state.compactBooking = false;
  initialiseStorage();
  attachEvents();
  render();
}

bootstrap();
