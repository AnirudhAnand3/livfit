import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

// ── helpers ──────────────────────────────────────────────────────────────────

function userRef(uid) { return doc(db, "users", uid); }
function planRef(uid) { return doc(db, "users", uid, "plans", "current"); }
function dayRef(uid, dateKey) { return doc(db, "users", uid, "days", dateKey); }

// ── writes (all fire-and-forget — call without await from UI code) ────────────

export async function syncProfileToCloud(uid, { profile, targets }) {
  try {
    await setDoc(userRef(uid), { profile, targets, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn("syncProfileToCloud failed", e);
  }
}

export async function syncPlanToCloud(uid, plan) {
  try {
    await setDoc(planRef(uid), { plan, updatedAt: Date.now() });
  } catch (e) {
    console.warn("syncPlanToCloud failed", e);
  }
}

export async function syncDayToCloud(uid, dateKey, { foodEntries, workoutDone }) {
  try {
    await setDoc(dayRef(uid, dateKey), { foodEntries, workoutDone, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn("syncDayToCloud failed", e);
  }
}

// ── reads (called once on startup) ───────────────────────────────────────────

export async function fetchProfileFromCloud(uid) {
  try {
    const snap = await getDoc(userRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("fetchProfileFromCloud failed", e);
    return null;
  }
}

export async function fetchPlanFromCloud(uid) {
  try {
    const snap = await getDoc(planRef(uid));
    return snap.exists() ? snap.data().plan : null;
  } catch (e) {
    console.warn("fetchPlanFromCloud failed", e);
    return null;
  }
}

export async function fetchDaysFromCloud(uid) {
  try {
    const snap = await getDocs(collection(db, "users", uid, "days"));
    const days = {};
    snap.forEach(d => { days[d.id] = d.data(); });
    return days;
  } catch (e) {
    console.warn("fetchDaysFromCloud failed", e);
    return {};
  }
}

