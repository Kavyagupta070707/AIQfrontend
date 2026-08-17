import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const CACHE_PREFIX = "aiq:api-cache:";
const DEFAULT_CACHE_TTL_MS = 60_000;

export const api = axios.create({
  baseURL: BACKEND_URL,
});

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const getCacheKey = (url: string) => `${CACHE_PREFIX}${BACKEND_URL}${url}`;

const readCache = <T>(url: string): T | null => {
  if (!canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(getCacheKey(url));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry.expiresAt || Date.now() > entry.expiresAt) {
      localStorage.removeItem(getCacheKey(url));
      return null;
    }

    return entry.data;
  } catch {
    localStorage.removeItem(getCacheKey(url));
    return null;
  }
};

const writeCache = <T>(url: string, data: T, ttlMs = DEFAULT_CACHE_TTL_MS) => {
  if (!canUseStorage()) return;

  try {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(getCacheKey(url), JSON.stringify(entry));
  } catch {
    // Ignore storage quota/private-mode failures and keep network behavior normal.
  }
};

export const clearApiCache = (matcher?: string) => {
  if (!canUseStorage()) return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .filter((key) => !matcher || key.includes(matcher))
    .forEach((key) => localStorage.removeItem(key));
};

export const cachedGet = async <T = any>(url: string, ttlMs = DEFAULT_CACHE_TTL_MS) => {
  const cached = readCache<T>(url);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  const response = await api.get<T>(url);
  writeCache(url, response.data, ttlMs);
  return { ...response, fromCache: false };
};

const mutate = async <T>(request: Promise<T>) => {
  const response = await request;
  clearApiCache();
  return response;
};

export const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const studyApi = {
  getDashboardData: async (userId: string) => {
    const [roadmaps, notes, shortNotes, stickyNotes, quizzes, results] = await Promise.all([
      cachedGet(`/api/roadmaps?createdBy=${userId}`),
      cachedGet(`/api/notes?createdBy=${userId}`),
      cachedGet(`/api/short-notes?createdBy=${userId}`),
      cachedGet(`/api/sticky-notes?createdBy=${userId}`),
      cachedGet(`/api/quiz?createdBy=${userId}`),
      cachedGet(`/api/results?userId=${userId}`),
    ]);

    return {
      roadmaps: roadmaps.data,
      notes: notes.data,
      shortNotes: shortNotes.data,
      stickyNotes: stickyNotes.data,
      quizzes: quizzes.data,
      results: results.data,
    };
  },
  generateRoadmap: (payload: any) => api.post("/api/ai/roadmap", payload),
  generateNotes: (payload: any) => api.post("/api/ai/notes", payload),
  saveRoadmap: (payload: any) => mutate(api.post("/api/roadmaps", payload)),
  getRoadmaps: (userId: string) => cachedGet(`/api/roadmaps?createdBy=${userId}`),
  getRoadmap: (id: string) => cachedGet(`/api/roadmaps/${id}`),
  updateRoadmap: (id: string, payload: any) => mutate(api.put(`/api/roadmaps/${id}`, payload)),
  deleteRoadmap: (id: string) => mutate(api.delete(`/api/roadmaps/${id}`)),
  getNotes: (userId: string) => cachedGet(`/api/notes?createdBy=${userId}`),
  saveNote: (payload: any) => mutate(api.post("/api/notes", payload)),
  updateNote: (id: string, payload: any) => mutate(api.put(`/api/notes/${id}`, payload)),
  deleteNote: (id: string) => mutate(api.delete(`/api/notes/${id}`)),
  generateShortNotes: (payload: any) => api.post("/api/ai/short-notes", payload),
  getShortNotes: (userId: string) => cachedGet(`/api/short-notes?createdBy=${userId}`),
  saveShortNote: (payload: any) => mutate(api.post("/api/short-notes", payload)),
  deleteShortNote: (id: string) => mutate(api.delete(`/api/short-notes/${id}`)),
  getStickyNotes: (userId: string) => cachedGet(`/api/sticky-notes?createdBy=${userId}`),
  saveStickyNote: (payload: any) => mutate(api.post("/api/sticky-notes", payload)),
  updateStickyNote: (id: string, payload: any) => mutate(api.put(`/api/sticky-notes/${id}`, payload)),
  deleteStickyNote: (id: string) => mutate(api.delete(`/api/sticky-notes/${id}`)),
  generateQuiz: (topic: string) => api.post("/api/ai/quiz", { topic }),
  saveQuiz: (payload: any) => mutate(api.post("/api/quiz", payload)),
  getResults: (userId: string) => cachedGet(`/api/results?userId=${userId}`),
};
