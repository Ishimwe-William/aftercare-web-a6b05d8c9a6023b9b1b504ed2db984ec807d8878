/**
 * DateRangePicker — reusable date range selection modal
 *
 * Props:
 *   open        {boolean}   — controls visibility
 *   onClose     {function}  — called when dismissed
 *   onApply     {function}  — called with { startDate, endDate } (Date objects)
 *   initialRange {object}  — optional { startDate, endDate } to pre-fill
 *
 * Usage:
 *   const [range, setRange] = useState({ startDate: null, endDate: null });
 *   <DateRangePicker
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onApply={(r) => { setRange(r); setOpen(false); }}
 *     initialRange={range}
 *   />
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Grid, Tooltip
} from '@mui/material';
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

const startOf = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const isSameDay = (a, b) =>
    a && b && startOf(a).getTime() === startOf(b).getTime();

const isBetween = (date, start, end) => {
    if (!start || !end) return false;
    const d = startOf(date).getTime();
    return d > startOf(start).getTime() && d < startOf(end).getTime();
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const PRESETS = [
    { label: 'Today',        getDates: () => { const t = new Date(); return { startDate: t, endDate: t }; } },
    { label: 'Yesterday',    getDates: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { startDate: d, endDate: d }; } },
    { label: 'This week',    getDates: () => { const t = new Date(); const s = new Date(t); s.setDate(t.getDate() - t.getDay()); return { startDate: s, endDate: t }; } },
    { label: 'Last 7 days',  getDates: () => { const t = new Date(); const s = new Date(t); s.setDate(t.getDate() - 6); return { startDate: s, endDate: t }; } },
    { label: 'This month',   getDates: () => { const t = new Date(); return { startDate: new Date(t.getFullYear(), t.getMonth(), 1), endDate: t }; } },
    { label: 'Last 30 days', getDates: () => { const t = new Date(); const s = new Date(t); s.setDate(t.getDate() - 29); return { startDate: s, endDate: t }; } },
    { label: 'This year',    getDates: () => { const t = new Date(); return { startDate: new Date(t.getFullYear(), 0, 1), endDate: t }; } },
];

// ─── Single month calendar ────────────────────────────────────────────────────
const MonthCalendar = ({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) => {
    const daysInMonth   = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const cells         = [];

    // Empty leading cells
    for (let i = 0; i < firstDayIndex; i++) {
        cells.push(<Box key={`empty-${i}`} sx={{ width: 36, height: 36 }} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date     = new Date(year, month, d);
        const isStart  = isSameDay(date, startDate);
        const isEnd    = isSameDay(date, endDate);
        const inRange  = isBetween(date, startDate, endDate || hoverDate);
        const isToday  = isSameDay(date, new Date());
        const isFuture = startOf(date) > startOf(new Date());

        cells.push(
            <Box
                key={d}
                onClick={() => !isFuture && onDayClick(date)}
                onMouseEnter={() => onDayHover(date)}
                sx={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: (isStart || isEnd) ? '50%' : (inRange ? '0' : '50%'),
                    bgcolor: (isStart || isEnd)
                        ? '#FDDE11'
                        : inRange ? 'rgba(253,222,17,0.18)' : 'transparent',
                    color: isFuture ? '#ccc' : '#111',
                    fontWeight: (isStart || isEnd || isToday) ? 700 : 400,
                    fontSize: 13,
                    cursor: isFuture ? 'default' : 'pointer',
                    border: isToday && !isStart && !isEnd ? '1.5px solid #FDDE11' : 'none',
                    outline: 'none',
                    userSelect: 'none',
                    transition: 'background 0.1s',
                    '&:hover': isFuture ? {} : {
                        bgcolor: (isStart || isEnd) ? '#FDDE11' : 'rgba(253,222,17,0.35)',
                        borderRadius: '50%',
                    },
                }}
            >
                {d}
            </Box>
        );
    }

    return (
        <Box sx={{ minWidth: 260 }}>
            <Typography fontWeight={700} fontSize={14} textAlign="center" mb={1}>
                {MONTHS[month]} {year}
            </Typography>
            <Grid container columns={7} sx={{ mb: 0.5 }}>
                {DAYS.map(d => (
                    <Grid item xs={1} key={d}>
                        <Typography fontSize={11} fontWeight={600} color="#888" textAlign="center">
                            {d}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0, width: 36 * 7 }}>
                {cells}
            </Box>
        </Box>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const DateRangePicker = ({ open, onClose, onApply, initialRange = {} }) => {
    const today = new Date();

    const [startDate, setStartDate] = useState(initialRange.startDate || null);
    const [endDate,   setEndDate]   = useState(initialRange.endDate   || null);
    const [hoverDate, setHoverDate] = useState(null);
    const [selecting, setSelecting] = useState('start'); // 'start' | 'end'

    // Show two months: left = current or previous, right = current
    const [leftYear,  setLeftYear]  = useState(today.getFullYear());
    const [leftMonth, setLeftMonth] = useState(today.getMonth() === 0 ? 11 : today.getMonth() - 1);
    const [rightYear,  setRightYear]  = useState(today.getFullYear());
    const [rightMonth, setRightMonth] = useState(today.getMonth());

    // Sync right month to always be one ahead of left
    useEffect(() => {
        let rm = leftMonth + 1;
        let ry = leftYear;
        if (rm > 11) { rm = 0; ry += 1; }
        setRightMonth(rm);
        setRightYear(ry);
    }, [leftMonth, leftYear]);

    // Reset when opened
    useEffect(() => {
        if (open) {
            setStartDate(initialRange.startDate || null);
            setEndDate(initialRange.endDate || null);
            setSelecting('start');
            setHoverDate(null);
        }
    }, [open]);

    const navigateLeft = () => {
        if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
        else { setLeftMonth(m => m - 1); }
    };

    const navigateRight = () => {
        if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
        else { setLeftMonth(m => m + 1); }
    };

    const handleDayClick = (date) => {
        if (selecting === 'start' || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
            setSelecting('end');
        } else {
            if (date < startDate) {
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
            setSelecting('start');
        }
    };

    const handlePreset = ({ getDates }) => {
        const { startDate: s, endDate: e } = getDates();
        setStartDate(s);
        setEndDate(e);
        setSelecting('start');
    };

    const handleApply = () => {
        if (startDate && endDate) {
            onApply({ startDate, endDate });
        }
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setSelecting('start');
        onApply({ startDate: null, endDate: null });
    };

    const fmt = (d) => d
        ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography fontWeight={700} fontSize={16}>Select Date Range</Typography>
                <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex' }}>

                    {/* ── Presets sidebar ── */}
                    <Box sx={{
                        width: 150, borderRight: '1px solid #e5e7eb',
                        p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5
                    }}>
                        {PRESETS.map(preset => (
                            <Button
                                key={preset.label}
                                size="small"
                                onClick={() => handlePreset(preset)}
                                sx={{
                                    justifyContent: 'flex-start', textTransform: 'none',
                                    fontSize: 12, fontWeight: 500, color: '#333',
                                    borderRadius: 1.5, px: 1.5,
                                    '&:hover': { bgcolor: 'rgba(253,222,17,0.2)' }
                                }}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </Box>

                    {/* ── Calendars ── */}
                    <Box sx={{ p: 2.5 }}>
                        {/* Selected range display */}
                        <Box sx={{
                            display: 'flex', gap: 2, mb: 2,
                            p: 1.5, bgcolor: '#f9fafb', borderRadius: 2,
                            border: '1px solid #e5e7eb'
                        }}>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography fontSize={10} color="#888" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                    Start Date
                                </Typography>
                                <Typography fontSize={13} fontWeight={700} color={startDate ? '#111' : '#ccc'}>
                                    {fmt(startDate)}
                                </Typography>
                            </Box>
                            <Box sx={{ width: 1, bgcolor: '#e5e7eb' }} />
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography fontSize={10} color="#888" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                    End Date
                                </Typography>
                                <Typography fontSize={13} fontWeight={700} color={endDate ? '#111' : '#ccc'}>
                                    {fmt(endDate)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Nav + calendars */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <IconButton size="small" onClick={navigateLeft} sx={{ mt: 0.5 }}>
                                <ChevronLeft />
                            </IconButton>

                            <MonthCalendar
                                year={leftYear} month={leftMonth}
                                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={(d) => selecting === 'end' && setHoverDate(d)}
                            />
                            <MonthCalendar
                                year={rightYear} month={rightMonth}
                                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={(d) => selecting === 'end' && setHoverDate(d)}
                            />

                            <IconButton size="small" onClick={navigateRight} sx={{ mt: 0.5 }}>
                                <ChevronRight />
                            </IconButton>
                        </Box>

                        <Typography fontSize={11} color="#888" mt={1.5}>
                            {selecting === 'start' ? 'Click to select a start date' : 'Click to select an end date'}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', gap: 1 }}>
                <Button size="small" onClick={handleClear} sx={{ color: '#888', textTransform: 'none' }}>
                    Clear
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button variant="outlined" size="small" onClick={onClose} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    disabled={!startDate || !endDate}
                    onClick={handleApply}
                    sx={{
                        textTransform: 'none', fontWeight: 700,
                        bgcolor: '#FDDE11', color: '#000',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#e5c800', boxShadow: 'none' },
                        '&:disabled': { bgcolor: '#f5f5f5', color: '#bbb' },
                    }}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DateRangePicker;