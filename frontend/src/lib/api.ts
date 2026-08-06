import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

export const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const studyApi = {
  getDashboardData: async (userId: string) => {
    const [roadmaps, notes, shortNotes, stickyNotes, quizzes, results] = await Promise.all([
      api.get(`/api/roadmaps?createdBy=${userId}`),
      api.get(`/api/notes?createdBy=${userId}`),
      api.get(`/api/short-notes?createdBy=${userId}`),
      api.get(`/api/sticky-notes?createdBy=${userId}`),
      api.get(`/api/quiz?createdBy=${userId}`),
      api.get(`/api/results?userId=${userId}`),
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
  saveRoadmap: (payload: any) => api.post("/api/roadmaps", payload),
  getRoadmaps: (userId: string) => api.get(`/api/roadmaps?createdBy=${userId}`),
  getRoadmap: (id: string) => api.get(`/api/roadmaps/${id}`),
  updateRoadmap: (id: string, payload: any) => api.put(`/api/roadmaps/${id}`, payload),
  deleteRoadmap: (id: string) => api.delete(`/api/roadmaps/${id}`),
  getNotes: (userId: string) => api.get(`/api/notes?createdBy=${userId}`),
  saveNote: (payload: any) => api.post("/api/notes", payload),
  updateNote: (id: string, payload: any) => api.put(`/api/notes/${id}`, payload),
  deleteNote: (id: string) => api.delete(`/api/notes/${id}`),
  generateShortNotes: (payload: any) => api.post("/api/ai/short-notes", payload),
  getShortNotes: (userId: string) => api.get(`/api/short-notes?createdBy=${userId}`),
  saveShortNote: (payload: any) => api.post("/api/short-notes", payload),
  deleteShortNote: (id: string) => api.delete(`/api/short-notes/${id}`),
  getStickyNotes: (userId: string) => api.get(`/api/sticky-notes?createdBy=${userId}`),
  saveStickyNote: (payload: any) => api.post("/api/sticky-notes", payload),
  updateStickyNote: (id: string, payload: any) => api.put(`/api/sticky-notes/${id}`, payload),
  deleteStickyNote: (id: string) => api.delete(`/api/sticky-notes/${id}`),
  generateQuiz: (topic: string) => api.post("/api/ai/quiz", { topic }),
  saveQuiz: (payload: any) => api.post("/api/quiz", payload),
  getResults: (userId: string) => api.get(`/api/results?userId=${userId}`),
};
