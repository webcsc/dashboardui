import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "@/types";

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

const QUICK_PRESETS = [
    { label: "7 derniers jours", days: 7 },
    { label: "15 derniers jours", days: 15 },
    { label: "30 derniers jours", days: 30 },
    { label: "90 derniers jours", days: 90 },
];

export function DateRangePicker({
    value,
    onChange,
    disabled = false,
    label = "Période personnalisée",
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date>(value.start);
    const [endDate, setEndDate] = useState<Date>(value.end);
    const [error, setError] = useState<string>("");

    const handleApply = () => {
        if (startDate > endDate) {
            setError("La date de fin doit être après la date de début");
            return;
        }

        onChange({ start: startDate, end: endDate });
        setOpen(false);
        setError("");
    };

    const handlePreset = (days: number) => {
        const end = endOfDay(new Date());
        const start = startOfDay(subDays(end, days - 1));
        setStartDate(start);
        setEndDate(end);
        setError("");
    };

    const handleReset = () => {
        setStartDate(value.start);
        setEndDate(value.end);
        setError("");
    };

    const getDurationDays = () => {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start text-left font-normal",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(value.start, "dd MMM", { locale: fr })} -{" "}
                    {format(value.end, "dd MMM yyyy", { locale: fr })}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{label}</DialogTitle>
                    <DialogDescription>
                        Sélectionnez une date de début et une date de fin pour votre période personnalisée.
                    </DialogDescription>
                </DialogHeader>

                {/* Quick Presets */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Raccourcis rapides</Label>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_PRESETS.map((preset) => (
                            <Button
                                key={preset.days}
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreset(preset.days)}
                                className="text-xs"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-3">
                        <Label htmlFor="start-date">Date de début</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="start-date"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setStartDate(startOfDay(date));
                                            setError("");
                                        }
                                    }}
                                    initialFocus
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* End Date */}
                    <div className="space-y-3">
                        <Label htmlFor="end-date">Date de fin</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="end-date"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setEndDate(endOfDay(date));
                                            setError("");
                                        }
                                    }}
                                    initialFocus
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Duration Display */}
                {startDate && endDate && !error && (
                    <div className="text-sm text-muted-foreground text-center">
                        Durée sélectionnée: <span className="font-semibold">{getDurationDays()} jours</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
                        {error}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Réinitialiser
                    </Button>
                    <Button onClick={handleApply}>Appliquer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
