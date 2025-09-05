"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentShift, TimeSlot } from "@/types/agent";
import { getTimeZones } from "@vvo/tzdb";
import { Minus, Plus, X } from "lucide-react";
import { Control, useFieldArray, useWatch, useFormContext } from "react-hook-form";

const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

interface AgentShiftsFormProps {
  control: Control<any>;
  name: string;
}

export function AgentShiftsForm({ control, name }: AgentShiftsFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  // Get form context to use setValue
  const { setValue } = useFormContext();

  // Watch the shifts array to get current values
  const shifts = useWatch({
    control,
    name,
    defaultValue: [],
  });

  const timezones = getTimeZones();

  const addShift = () => {
    if (fields.length < 7) {
      // Find the first available day
      const usedDays = shifts.map((shift: any) => shift?.dayOfWeek).filter(Boolean);
      const availableDay = WEEKDAYS.find(day => !usedDays.includes(day.value));
      
      append({
        dayOfWeek: availableDay?.value || "monday",
        isWorkingDay: true,
        timeSlots: [
          {
            startHour: 9,
            startMinute: 0,
            endHour: 17,
            endMinute: 0,
          },
        ],
        isActive: true,
        priority: 1,
        description: "",
      });
    }
  };

  const removeShift = (index: number) => {
    remove(index);
  };

  const getAvailableDays = (currentIndex: number) => {
    const usedDays = shifts
      .map((shift: any, index: number) => index !== currentIndex ? shift?.dayOfWeek : null)
      .filter(Boolean);
    
    return WEEKDAYS.filter(day => !usedDays.includes(day.value));
  };

  const validateShift = (shift: any, index: number) => {
    const errors: string[] = [];
    
    // Check for duplicate days
    const duplicateDayIndex = shifts.findIndex((s: any, i: number) => 
      i !== index && s?.dayOfWeek === shift.dayOfWeek
    );
    
    if (duplicateDayIndex !== -1) {
      errors.push(`Day ${shift.dayOfWeek} is already assigned to another shift`);
    }
    
    // Check if working day has valid time slots
    if (shift.isWorkingDay && shift.timeSlots && shift.timeSlots.length > 0) {
      const timeSlot = shift.timeSlots[0];
      const startTime = timeSlot.startHour * 60 + timeSlot.startMinute;
      const endTime = timeSlot.endHour * 60 + timeSlot.endMinute;
      
      if (startTime >= endTime) {
        errors.push("End time must be after start time");
      }
    }
    
    return errors;
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const parseTime = (timeString: string) => {
    const [time, period] = timeString.split(" ");
    const [hour, minute] = time.split(":").map(Number);
    let hour24 = hour;
    
    if (period === "PM" && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === "AM" && hour === 12) {
      hour24 = 0;
    }
    
    return { hour: hour24, minute };
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = formatTime(hour, minute);
        const value = `${hour}:${minute}`;
        options.push({ value, label: timeString });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Agent Shifts</h3>
          <p className="text-sm text-muted-foreground">
            Configure working hours for each day of the week
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addShift}
          disabled={fields.length >= 7}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </Button>
      </div>

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No shifts configured. Click "Add Shift" to get started.
              </p>
              <Button type="button" variant="outline" onClick={addShift}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Shift {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeShift(index)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day Selection */}
              <FormField
                control={control}
                name={`${name}.${index}.dayOfWeek`}
                render={({ field: dayField }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      value={dayField.value}
                      onValueChange={dayField.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableDays(index).map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Working Day Toggle */}
              <FormField
                control={control}
                name={`${name}.${index}.isWorkingDay`}
                render={({ field: workingField }) => (
                  <FormItem>
                    <FormLabel>Working Day</FormLabel>
                    <Select
                      value={workingField.value ? "true" : "false"}
                      onValueChange={(value) => {
                        const isWorking = value === "true";
                        workingField.onChange(isWorking);
                        
                        // Clear time slots if switching to non-working day
                        if (!isWorking) {
                          setValue(`${name}.${index}.timeSlots`, []);
                        } else {
                          // Add default time slot if switching to working day and no time slots exist
                          const currentTimeSlots = shifts[index]?.timeSlots || [];
                          if (currentTimeSlots.length === 0) {
                            setValue(`${name}.${index}.timeSlots`, [{
                              startHour: 9,
                              startMinute: 0,
                              endHour: 17,
                              endMinute: 0,
                            }]);
                          }
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Working Day</SelectItem>
                        <SelectItem value="false">Non-Working Day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Slots - Only show if it's a working day */}
            <FormField
              control={control}
              name={`${name}.${index}.isWorkingDay`}
              render={({ field: workingField }) => {
                if (!workingField.value) {
                  return <div></div>;
                }

                return (
                  <div className="space-y-3">
                    <FormLabel>Working Hours</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name={`${name}.${index}.timeSlots.0`}
                        render={({ field: timeSlotField }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <Select
                              value={`${timeSlotField.value?.startHour || 9}:${timeSlotField.value?.startMinute || 0}`}
                              onValueChange={(value) => {
                                const { hour, minute } = parseTime(
                                  timeOptions.find(opt => opt.value === value)?.label || "9:00 AM"
                                );
                                timeSlotField.onChange({
                                  ...timeSlotField.value,
                                  startHour: hour,
                                  startMinute: minute,
                                });
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`${name}.${index}.timeSlots.0`}
                        render={({ field: timeSlotField }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <Select
                              value={`${timeSlotField.value?.endHour || 17}:${timeSlotField.value?.endMinute || 0}`}
                              onValueChange={(value) => {
                                const { hour, minute } = parseTime(
                                  timeOptions.find(opt => opt.value === value)?.label || "5:00 PM"
                                );
                                timeSlotField.onChange({
                                  ...timeSlotField.value,
                                  endHour: hour,
                                  endMinute: minute,
                                });
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              }}
            />

            {/* Description */}
            <FormField
              control={control}
              name={`${name}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Regular Monday hours"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}

      {/* Timezone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timezone</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Timezone</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {timezones.map((tz) => (
                      <SelectItem key={tz.name} value={tz.name}>
                        {tz.name} ({tz.alternativeName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
