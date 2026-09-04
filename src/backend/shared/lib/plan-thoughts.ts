const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning snack",
  lunch: "Lunch",
  afternoonSnack: "Afternoon snack",
  snacks: "Snack",
  eveningSnack: "Evening snack",
  dinner: "Dinner",
  beforeBed: "Before bed",
};

export function createThoughtNote(onThought?: (text: string) => void) {
  const seen = new Set<string>();
  return (text: string) => {
    const value = text.replace(/\s+/g, " ").trim();
    if (!onThought || !value || seen.has(value)) return;
    seen.add(value);
    try {
      onThought(value);
    } catch {
      /* client disconnected */
    }
  };
}

function unescapeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value;
  }
}

function capitalize(day: string) {
  return day.slice(0, 1).toUpperCase() + day.slice(1);
}

export type StreamThoughtScan = {
  left: number;
  seen: Set<string>;
};

function emitOnce(scan: StreamThoughtScan, key: string, note: (text: string) => void, text: string) {
  if (scan.left <= 0 || scan.seen.has(key)) return;
  scan.seen.add(key);
  scan.left -= 1;
  note(text);
}

export function scanDietPlanJson(buffer: string, note: (text: string) => void, scan: StreamThoughtScan) {
  for (const day of WEEKDAYS) {
    if (!new RegExp(`"${day}"\\s*:`).test(buffer)) continue;
    emitOnce(scan, `day:${day}`, note, `Writing ${capitalize(day)}'s meals.`);
  }

  for (const [key, label] of Object.entries(MEAL_LABELS)) {
    const match = buffer.match(
      new RegExp(`"${key}"\\s*:\\s*\\{[\\s\\S]{0,500}?"name"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`)
    );
    if (!match?.[1]) continue;
    emitOnce(scan, `meal:${key}:${match[1]}`, note, `${label}: ${unescapeJsonString(match[1])}.`);
  }
}

export function scanWorkoutPlanJson(buffer: string, note: (text: string) => void, scan: StreamThoughtScan) {
  for (const day of WEEKDAYS) {
    if (!new RegExp(`"${day}"\\s*:`).test(buffer)) continue;
    emitOnce(scan, `day:${day}`, note, `Programming ${capitalize(day)}.`);
  }

  const dayTitle = /"day"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  let match: RegExpExecArray | null;
  while ((match = dayTitle.exec(buffer))) {
    const title = unescapeJsonString(match[1]).trim();
    if (!title) continue;
    emitOnce(scan, `title:${title}`, note, title.endsWith(".") ? title : `${title}.`);
  }

  const exercisesAt = buffer.indexOf('"exercises"');
  if (exercisesAt < 0) return;
  const nameRe = /"name"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  const slice = buffer.slice(exercisesAt);
  while ((match = nameRe.exec(slice))) {
    const name = unescapeJsonString(match[1]).trim();
    if (!name || name.length > 48) continue;
    emitOnce(scan, `ex:${name}`, note, `Adding ${name}.`);
  }
}

export async function withThoughtHeartbeats<T>(
  note: (text: string) => void,
  lines: string[],
  work: (stopHeartbeats: () => void) => Promise<T>
): Promise<T> {
  let index = 0;
  let ticking = true;
  const timer = setInterval(() => {
    if (!ticking || index >= lines.length) return;
    note(lines[index]);
    index += 1;
  }, 2600);

  const stopHeartbeats = () => {
    ticking = false;
    clearInterval(timer);
  };

  try {
    return await work(stopHeartbeats);
  } finally {
    stopHeartbeats();
  }
}
