"use client";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Plus, Eye, Trash } from "lucide-react";
import { api, Event } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const customClassNames = {
  months: "flex flex-col w-full",
  month: "w-full",
  caption: "flex justify-center pt-1 relative items-center w-full",
  caption_label: "text-sm font-medium",
  table: "w-full border-collapse space-y-1",
  head_row: "flex w-full mt-4",
  head_cell:
    "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
  row: "flex w-full mt-2",
  cell: "relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20",
  day: "w-full p-0 font-normal hover:bg-accent rounded-md transition-colors",
  day_selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  day_today: "bg-accent text-accent-foreground",
  day_outside: "text-muted-foreground opacity-50",
  day_disabled: "text-muted-foreground opacity-50",
  day_hidden: "invisible",
  nav: "space-x-1 flex items-center",
  nav_button: cn("h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
};

interface DayButtonProps {
  date: Date;
  selected?: boolean;
  isOutside?: boolean;
  onSelect?: (date: Date) => void;
  events: Event[];
  onAddEvent?: (date: Date) => void;
  onViewEvents?: (date: Date, events: Event[]) => void;
  onDeleteEvent?: (eventId: number) => void;
}

function DayButton({
  date,
  selected,
  isOutside,
  onSelect,
  events,
  onAddEvent,
  onViewEvents,
  onDeleteEvent,
}: DayButtonProps) {
  const isToday =
    format(new Date(), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "" });

  const handleAddEvent = async () => {
    try {
      await api.addEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: format(date, "yyyy-MM-dd"),
      });
      setIsAddDialogOpen(false);
      setNewEvent({ title: "", description: "" });
      onAddEvent?.(date);
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleViewDetails = () => {
    setIsViewDialogOpen(true);
    onViewEvents?.(date, events);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await api.deleteEvent(eventId);
      onDeleteEvent?.(eventId);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const dayEvents = events.filter(
    (event) => event.date === format(date, "yyyy-MM-dd")
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => onSelect?.(date)}
            className={cn(
              "w-full h-14 flex items-center justify-center rounded-md transition-colors",
              selected &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
              isToday && !selected && "bg-accent text-accent-foreground",
              !selected && !isToday && "hover:bg-accent/50",
              isOutside && "text-muted-foreground opacity-50"
            )}
          >
            <time dateTime={format(date, "yyyy-MM-dd")}>
              {format(date, "d")}
            </time>
            {dayEvents.length > 0 && (
              <span className="absolute bottom-1 right-1 text-xs text-blue-500 font-bold">
                {dayEvents.length}
              </span>
            )}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsAddDialogOpen(true)} asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              添加事件
            </Button>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleViewDetails} asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              查看详情
            </Button>
          </ContextMenuItem>
          {dayEvents.length > 0 && (
            <>
              <ContextMenuSeparator />
              {dayEvents.map((event) => (
                <ContextMenuItem
                  key={event.id}
                  onClick={() => handleDeleteEvent(event.id!)}
                  asChild
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    <Trash className="w-4 h-4 mr-2" />
                    删除 {event.title}
                  </Button>
                </ContextMenuItem>
              ))}
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* 添加事件对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加事件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddEvent}>添加</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看事件对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>事件详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dayEvents.length === 0 ? (
              <p>当天没有事件</p>
            ) : (
              dayEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <h3 className="font-medium">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export interface DateTableProps {
  children?: React.ReactNode;
  onDateSelect?: (date: Date) => void;
  onEventAdd?: (date: Date) => void;
  onEventView?: (date: Date, events: Event[]) => void;
  onEventDelete?: (eventId: number) => void;
}

export interface DateTableRef {
  setSelectedDate: (date: Date) => void;
  refreshEvents: () => Promise<void>;
}

export const DateTable = forwardRef<DateTableRef, DateTableProps>(
  ({ children, onDateSelect, onEventAdd, onEventView, onEventDelete }, ref) => {
    const [selected, setSelected] = useState<Date>(new Date());
    const [events, setEvents] = useState<Event[]>([]);

    const fetchEvents = async () => {
      try {
        const allEvents = await api.getAllEvents();
        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    useEffect(() => {
      fetchEvents();
    }, []);

    useImperativeHandle(ref, () => ({
      setSelectedDate: (date: Date) => {
        setSelected(date);
      },
      refreshEvents: fetchEvents,
    }));

    return (
      <div className="w-full h-full">
        <div className="flex justify-between items-center m-4 mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(new Date())}
          >
            回到今日
          </Button>
          {children}
        </div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            setSelected(date);
            onDateSelect?.(date!);
          }}
          classNames={customClassNames}
          components={{
            Day: ({ date, displayMonth }) => (
              <DayButton
                date={date}
                selected={
                  selected
                    ? format(selected, "yyyy-MM-dd") ===
                      format(date, "yyyy-MM-dd")
                    : false
                }
                isOutside={date.getMonth() !== displayMonth.getMonth()}
                onSelect={setSelected}
                events={events}
                onAddEvent={onEventAdd}
                onViewEvents={onEventView}
                onDeleteEvent={onEventDelete}
              />
            ),
          }}
        />
      </div>
    );
  }
);

DateTable.displayName = "DateTable";
