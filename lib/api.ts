const API_BASE_URL = "http://localhost:3001/api";

export interface Event {
  id?: number;
  title: string;
  description?: string;
  date: string;
  created_at?: string;
  isEdit?: boolean;
}

export const api = {
  // 获取所有事件
  getAllEvents: async (): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    return response.json();
  },

  // 获取特定月份的事件
  getEventsByMonth: async (yearMonth: string): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events/month/${yearMonth}`);
    if (!response.ok) {
      throw new Error("Failed to fetch events for month");
    }
    return response.json();
  },

  // 获取特定日期的事件
  getEventsByDate: async (date: string): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events/${date}`);
    if (!response.ok) {
      throw new Error("Failed to fetch events for date");
    }
    return response.json();
  },

  // 添加新事件
  addEvent: async (event: Omit<Event, "id" | "created_at">): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error("Failed to add event");
    }
    return response.json();
  },

  // 删除事件
  deleteEvent: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete event");
    }
  },

  // 更新事件
  updateEvent: async (
    id: number,
    event: Omit<Event, "id" | "created_at">
  ): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error("Failed to update event");
    }
    return response.json();
  },
};
