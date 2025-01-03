import React, { useState, useEffect } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

type Experience = {
  id: string;
  title: string;
  company: string;
  duration: string;
};

type AvailabilityBlock = {
  day: string;
  slots: string[];
};

type Expert = {
  id: number;
  name: string;
  title: string;
  company: string;
  network: string;
  country: string;
  perspective: string;
  availability: string;
  experience: Experience[];
  availabilityBlocks: AvailabilityBlock[];
}

interface SchedulingDialogProps {
  selectedExpert: Expert | null;
  isSchedulingDialogOpen: boolean;
  onClose: () => void;
}

function SchedulingDialog({ selectedExpert, isSchedulingDialogOpen, onClose }: SchedulingDialogProps) {
  const expert = selectedExpert
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [duration, setDuration] = useState<number | null>(null)
  
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)

  const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
    const minutes = i * 15
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  })

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}:00`)
      const end = new Date(`2000-01-01T${endTime}:00`)
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      setDuration(durationMinutes > 0 ? durationMinutes : null)
    } else {
      setDuration(null)
    }
  }, [startTime, endTime])

  const handleReviewCall = () => {
    setIsReviewMode(true)
  }

  const handleScheduleCall = () => {
    setIsConfirmationMode(true)
  }

  const resetForm = () => {
    setDate(undefined)
    setStartTime('')
    setEndTime('')
    setDuration(null)
    setIsReviewMode(false)
    setIsConfirmationMode(false)
    onClose()
  }

  const isFormValid = date && startTime && endTime && duration && duration > 0

  const isDateInFuture = (day: Date) => {
    return isBefore(startOfDay(new Date()), startOfDay(day))
  }

  if (!isSchedulingDialogOpen || !expert) return null;

  return (
    <Dialog open={isSchedulingDialogOpen} onOpenChange={(open) => !open && resetForm()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule expert call</DialogTitle>
        </DialogHeader>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{expert.name}</h3>
          <p className="text-sm text-gray-500">{expert.title} at {expert.company}</p>
        </div>
        {!isReviewMode && !isConfirmationMode ? (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={`w-[280px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(selectedDate: Date) => !isDateInFuture(selectedDate)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start time
                </Label>
                <Select onValueChange={setStartTime} value={startTime}>
                  <SelectTrigger id="startTime" className="w-[280px]">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End time
                </Label>
                <Select onValueChange={setEndTime} value={endTime}>
                  <SelectTrigger id="endTime" className="w-[280px]">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.filter(time => time > startTime).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {duration !== null && (
                <div className="text-center text-sm text-gray-500">
                  Call duration: {duration} minutes
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleReviewCall} disabled={!isFormValid}>
                Review call request
              </Button>
            </DialogFooter>
          </form>
        ) : isReviewMode && !isConfirmationMode ? (
          <div className="py-4">
            <h4 className="font-semibold mb-2">Call Details:</h4>
            <p>Date: {date ? format(date, "PPP") : "Not selected"}</p>
            <p>Start Time: {startTime || "Not selected"}</p>
            <p>End Time: {endTime || "Not selected"}</p>
            {duration !== null && <p>Duration: {duration} minutes</p>}
            <DialogFooter className="mt-4">
              <Button type="button" onClick={handleScheduleCall}>
                Send call request to expert
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-4">
            <h4 className="font-semibold mb-2">Call request sent</h4>
            <p>Your request has been sent to the expert network. You will receive a calendar invite when the call has been confirmed.</p>
            <p className="mt-2">Date: {date ? format(date, "PPP") : "Not selected"}</p>
            <p>Time: {startTime} - {endTime}</p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SchedulingDialog;