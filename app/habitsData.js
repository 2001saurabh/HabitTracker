export const WEEKDAY_HABITS = [
  { id: "wake_7am", name: "⏰ Wake by 7 AM", time: "07:00", applies: "all" },
  { id: "water_500ml", name: "💧 500 ml water on waking", time: "07:05", applies: "all" },
  { id: "pre_workout", name: "☕ Pre-workout (Coffee + dates/banana)", time: "07:30", applies: "all" },
  { id: "gym", name: "🏋️ Gym Workout (45-60 min)", time: "08:00", applies: "all" },
  { id: "post_gym_cooldown", name: "🥤 Post-gym Cooldown & Hydrate (pink salt)", time: "09:00", applies: "all" },
  { id: "bath", name: "🚿 Bath & Refresh", time: "09:30", applies: "all" },
  { id: "breakfast", name: "🥣 Protein Breakfast (Whey + oats/roti-pb)", time: "09:50", applies: "all" },
  { id: "clarity_block", name: "🧘 Morning Clarity Block (30 min)", time: "10:30", applies: "all" },
  { id: "write_priorities", name: "📋 3 Priorities Written", time: "10:35", applies: "all" },
  { id: "read_article", name: "📖 Read Analytics/Business Article", time: "10:40", applies: "all" },
  { id: "record_speaking", name: "🎤 Record 90-sec Speaking (MWF)", time: "10:45", applies: "mwf" },
  { id: "work_block_1", name: "💻 Deep Work Block 1 (11:00 AM - 12:30 PM)", time: "11:00", applies: "all" },
  { id: "lunch_break", name: "🥗 Lunch Break (12:30 PM - 1:00 PM)", time: "12:30", applies: "all" },
  { id: "nap_15m", name: "⏱️ 15-min Power Nap (1:00 PM - 1:15 PM)", time: "13:00", applies: "all" },
  { id: "insta_capped", name: "📵 Instagram Capped (1:15 PM - 1:25 PM)", time: "13:15", applies: "all" },
  { id: "work_block_2", name: "💻 Deep Work Block 2 (1:25 PM - 4:30 PM)", time: "13:25", applies: "all" },
  { id: "tea_break", name: "☕ Tea Break (4:30 PM - 5:00 PM)", time: "16:30", applies: "all" },
  { id: "standup_prep", name: "📞 Standup Prep (5:00 PM - 5:20 PM)", time: "17:00", applies: "all" },
  { id: "standup_call", name: "🗣️ Standup Call (5:20 PM - 5:40 PM)", time: "17:20", applies: "all" },
  { id: "work_block_3", name: "💻 Deep Work Block 3 (5:40 PM - 7:45 PM)", time: "17:40", applies: "all" },
  { id: "eod_note", name: "📝 EOD Summary Note (3 done, 1 pending)", time: "19:45", applies: "all" },
  { id: "log_off", name: "🛑 Log Off Work (8:00 PM)", time: "20:00", applies: "all" },
  { id: "evening_walk", name: "🌙 Evening Walk in Garden (9:00 PM)", time: "21:00", applies: "all" },
  { id: "read_pages", name: "📚 Read 15 pages / Podcast", time: "21:45", applies: "all" },
  { id: "sleep_1030", name: "😴 Sleep by 10:30 PM", time: "22:30", applies: "all" }
];

export const WEEKEND_HABITS = [
  { id: "wake_7am", name: "⏰ Wake by 7 AM", time: "07:00", applies: "all" },
  { id: "water_500ml", name: "💧 500 ml water on waking", time: "07:05", applies: "all" },
  { id: "pre_workout", name: "☕ Pre-workout Coffee", time: "07:20", applies: "all" },
  { id: "gym", name: "🏋️ Gym Workout", time: "07:35", applies: "all" },
  { id: "post_gym_cooldown", name: "🥤 Post-gym Cooldown & Bath", time: "09:00", applies: "all" },
  { id: "breakfast", name: "🥣 Protein Breakfast", time: "09:30", applies: "all" },
  { id: "deep_skill", name: "🧠 90-min Deep Skill Block (AI/Analytics)", time: "10:00", applies: "all" },
  { id: "insta_capped_we", name: "📵 Instagram ≤ 20 min (timer on)", time: "13:00", applies: "all" },
  { id: "evening_walk", name: "🌙 Evening Walk in Garden", time: "21:00", applies: "all" },
  { id: "read_relax", name: "📚 Read / Relax (no brain rot)", time: "21:45", applies: "all" },
  { id: "sunday_review", name: "🔁 Sunday Weekly Review (Sun only)", time: "22:00", applies: "sunday" },
  { id: "sleep_1030", name: "😴 Sleep by 10:30 PM", time: "22:30", applies: "all" }
];

export const MONTHS = [
  { year: 2026, month: 8, name: "August 2026" },
  { year: 2026, month: 9, name: "September 2026" },
  { year: 2026, month: 10, name: "October 2026" },
  { year: 2026, month: 11, name: "November 2026" },
  { year: 2026, month: 12, name: "December 2026" },
  { year: 2027, month: 1, name: "January 2027" },
  { year: 2027, month: 2, name: "February 2027" },
  { year: 2027, month: 3, name: "March 2027" },
  { year: 2027, month: 4, name: "April 2027" },
  { year: 2027, month: 5, name: "May 2027" },
  { year: 2027, month: 6, name: "June 2027" },
  { year: 2027, month: 7, name: "July 2027" }
];

export function habitApplies(appliesType, dateObj) {
  const day = dateObj.getDay(); // 0 is Sun, 1 is Mon...
  if (appliesType === "all") return true;
  if (appliesType === "mwf") return day === 1 || day === 3 || day === 5;
  if (appliesType === "sunday") return day === 0;
  return false;
}
