"use client";
import { useEffect, useState, useRef } from "react";
import { DateTable, DateTableRef } from "@/components/custom/dateTable";
import { api, Event } from "@/lib/api";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [newEvent, setNewEvent] = useState({ title: "", description: "" });
  const dateTableRef = useRef<DateTableRef>(null);

  // 获取当月事件
  const fetchMonthEvents = async (date: Date) => {
    try {
      const monthEvents = await api.getEventsByMonth(format(date, "yyyy-MM"));
      setEvents(monthEvents);
    } catch (error) {
      console.error("Failed to fetch month events:", error);
    }
  };

  // 获取本周事件
  const getWeekEvents = () => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // 从周一开始
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start, end });

    return weekDays.map((day) => {
      const dayEvents = events.filter(
        (event) => event.date === format(day, "yyyy-MM-dd")
      );
      return {
        date: day,
        events: dayEvents,
      };
    });
  };

  // 生成周计划
  const generateWeeklyPlan = () => {
    const weekEvents = getWeekEvents();
    return weekEvents.map(({ date, events }) => ({
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
      events,
    }));
  };

  useEffect(() => {
    fetchMonthEvents(date);
  }, [date]);

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleMonthChange = (newDate: Date) => {
    setDate(newDate);
  };

  const handleEventAdd = async (date: Date) => {
    await fetchMonthEvents(date);
  };

  const handleEventView = (date: Date, dayEvents: Event[]) => {
    console.log("Viewing events for date:", date, dayEvents);
  };

  const handleEventDelete = async (eventId: number) => {
    try {
      await api.deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description || "",
    });
  };

  const handleSave = async () => {
    if (!editingEvent) return;

    try {
      const updatedEvent = await api.updateEvent(editingEvent.id!, {
        ...editingEvent,
        ...editForm,
      });

      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setEditingEvent(null);
      fetchMonthEvents(date);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
  };

  const handleAddNewEvent = async () => {
    if (!selectedDate || !newEvent.title) return;

    try {
      await api.addEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: selectedDate,
      });
      setIsAddDialogOpen(false);
      setNewEvent({ title: "", description: "" });
      fetchMonthEvents(date);
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const weeklyPlan = generateWeeklyPlan();

  const handleGoToToday = () => {
    const today = new Date();
    setDate(today);
    dateTableRef.current?.setSelectedDate(today);
    dateTableRef.current?.setCurrentMonth(today);
  };

  return (
    <div className="w-full h-screen flex flex-col p-4 pt-0">
      <div className="flex gap-4 min-h-0">
        <div className="w-1/2 rounded-lg shadow-lg">
          <DateTable
            ref={dateTableRef}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            onEventAdd={handleEventAdd}
            onEventView={handleEventView}
            onEventDelete={handleEventDelete}
            events={events}
          >
            <Button variant="outline" size="sm" onClick={handleGoToToday}>
              回到今日
            </Button>
          </DateTable>
        </div>
        <div className="w-1/2 rounded-lg shadow-lg overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">本周事项</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {weeklyPlan.map(({ date, dayName, events }) => (
                <div key={date} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {dayName} ({date})
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {events.length} 个事项
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full w-4 h-4"
                        onClick={() => {
                          setSelectedDate(date);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {events.length > 0 ? (
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="group relative bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                        >
                          {editingEvent?.id === event.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editForm.title}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                                className="h-8"
                              />
                              <Textarea
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                className="h-20"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancel}
                                >
                                  取消
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleSave}
                                >
                                  保存
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              {event.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {event.description}
                                </div>
                              )}
                              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEdit(event)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">暂无安排</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 添加事项对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加事项</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="标题"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>
            <div>
              <Textarea
                placeholder="描述"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewEvent({ title: "", description: "" });
                }}
              >
                取消
              </Button>
              <Button onClick={handleAddNewEvent}>添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
