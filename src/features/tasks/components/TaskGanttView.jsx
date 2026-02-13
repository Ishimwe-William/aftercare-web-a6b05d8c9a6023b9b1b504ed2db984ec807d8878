import React, {useMemo, useRef, useEffect, useState, useLayoutEffect} from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    Button,
    ButtonGroup,
    Select,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    SwapHoriz as ReassignIcon,
    Today as TodayIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    FitScreen as FitScreenIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {format, differenceInDays, addDays, startOfDay, isBefore} from 'date-fns';

// Config
const MAX_DAYS = 365; // limit gantt to max 1 year
const INFO_COL_WIDTH = 260; // px: width of frozen info column (task/technician)
const DEFAULT_VIEW_DAYS = 30;
const ZOOM_LEVELS = {
    day: 1,
    week: 7,
};

// helper for status color mapping
const getStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA726',
        IN_PROGRESS: '#42A5F5',
        COMPLETED: '#66BB6A',
        CANCELLED: '#EF5350',
        PAUSED: '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
};

const TaskGanttView = ({
                           tasks,
                           filters,
                           technicians,
                           onEdit,
                           onReassign,
                           onDelete,
                       }) => {
    const containerRef = useRef(null); // scrolling container for timeline
    const [zoom, setZoom] = useState('day'); // 'day' | 'week'
    const [daysInView, setDaysInView] = useState(DEFAULT_VIEW_DAYS);
    const [startDate, setStartDate] = useState(startOfDay(new Date()));

    const [dayWidth, setDayWidth] = useState(48); // px per day, computed responsively

    // Helpers
    const getTechnicianName = (technicianId) => {
        const tech = technicians.find(t => t.id === technicianId);
        return tech ? tech.fullName : 'Unknown';
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filters.technicianId && task.technicianId !== filters.technicianId) return false;
            if (filters.motorcycleId && task.motorcycleId !== filters.motorcycleId) return false;
            if (filters.status && filters.status !== 'all' && task.status !== filters.status) return false;
            return task.assignedAt || task.dueTime || task.completedAt;
        });
    }, [tasks, filters]);

    // Compute min/max dates from tasks (clamped to 1 year span)
    const {minDate} = useMemo(() => {
        if (filteredTasks.length === 0) {
            const t = startOfDay(new Date());
            return {minDate: t, maxDate: addDays(t, DEFAULT_VIEW_DAYS - 1)};
        }
        const dates = filteredTasks.flatMap(task => [
            task.assignedAt ? startOfDay(new Date(task.assignedAt)) : null,
            task.dueTime ? startOfDay(new Date(task.dueTime)) : null,
            task.completedAt ? startOfDay(new Date(task.completedAt)) : null
        ]).filter(Boolean);
        let minD = startOfDay(new Date(Math.min(...dates)));
        let maxD = startOfDay(new Date(Math.max(...dates)));
        // ensure at least 1 day
        if (differenceInDays(maxD, minD) < 0) maxD = addDays(minD, 1);
        // clamp span to MAX_DAYS
        if (differenceInDays(maxD, minD) > MAX_DAYS) {
            maxD = addDays(minD, MAX_DAYS);
        }
        return {minDate: minD, maxDate: maxD};
    }, [filteredTasks]);

    useEffect(() => {
        setDaysInView(ZOOM_LEVELS[zoom] * DEFAULT_VIEW_DAYS);
    }, [zoom]);

    // Compute responsive dayWidth based on container width OR fallbacks
    const recomputeDayWidth = () => {
        const container = containerRef.current;
        if (!container) return;
        const availableWidth = container.clientWidth - INFO_COL_WIDTH; // space for timeline
        // Want dayWidth to allow a comfortable number of days (daysInView)
        const computed = Math.max(20, Math.floor(availableWidth / Math.max(7, daysInView)));
        setDayWidth(computed);
    };

    useLayoutEffect(() => {
        recomputeDayWidth();
        const ro = new ResizeObserver(() => recomputeDayWidth());
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener('orientationchange', recomputeDayWidth);
        return () => {
            ro.disconnect();
            window.removeEventListener('orientationchange', recomputeDayWidth);
        };
    }, [daysInView]);

    // Build date headers for current view
    const dateHeaders = useMemo(() => {
        if (!startDate) return [];
        const days = Math.min(MAX_DAYS, daysInView || DEFAULT_VIEW_DAYS);
        return Array.from({length: days}, (_, i) => addDays(startDate, i));
    }, [startDate, daysInView]);

    // Convert tasks to pixel positions using startDate & dayWidth
    const taskPositions = useMemo(() => {
        if (!startDate) return [];

        const daysInViewClamped = Math.min(MAX_DAYS, daysInView);
        const viewEnd = addDays(startDate, daysInViewClamped - 1); // End date of the visible timeline
        const viewEndDay = startOfDay(viewEnd); // Ensure comparison is always start of day

        return filteredTasks.map(task => {
            const taskStart = startOfDay(task.assignedAt ? new Date(task.assignedAt) : task.dueTime ? new Date(task.dueTime) : new Date());
            const taskEnd = startOfDay(task.dueTime ? new Date(task.dueTime) : task.completedAt ? new Date(task.completedAt) : addDays(taskStart, 1));

            // Logic to filter out tasks completely outside the view
            if (isBefore(taskEnd, startDate)) return null;
            if (isBefore(viewEndDay, taskStart)) return null;

            // Clamp positions to view window for partial visibility
            const clampedStart = isBefore(taskStart, startDate) ? startDate : taskStart;
            const clampedEnd = isBefore(taskEnd, startDate) ? startDate : (isBefore(viewEndDay, taskEnd) ? viewEndDay : taskEnd);

            const offsetDays = Math.max(0, differenceInDays(clampedStart, startDate));
            const durationDays = Math.max(0, differenceInDays(startOfDay(clampedEnd), startOfDay(clampedStart)) + 1);

            return {
                task,
                leftPx: offsetDays * dayWidth,
                widthPx: durationDays * dayWidth,
                originalStart: taskStart,
                durationDays: durationDays
            };
        })
            .filter(pos => pos !== null)
            .sort((a, b) => new Date(b.originalStart).getTime() - new Date(a.originalStart).getTime());
    }, [filteredTasks, startDate, dayWidth, daysInView]);

    // Scroll-to helpers: scroll the container so a date (or task) is centered
    const scrollToDate = (date, alignLeft = false) => {
        if (!containerRef.current) return;
        const daysOffset = differenceInDays(startOfDay(date), startDate);
        const x = daysOffset * dayWidth;
        const containerVisibleWidth = containerRef.current.clientWidth - INFO_COL_WIDTH;
        let targetScrollLeft = alignLeft ? x : x - containerVisibleWidth / 2;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, (dateHeaders.length * dayWidth) - containerVisibleWidth));
        containerRef.current.scrollTo({left: targetScrollLeft, behavior: 'smooth'});
    };

    // Controls: prev / next by daysInView
    const onPrev = () => setStartDate(prev => addDays(prev, -Math.max(7, Math.floor(daysInView / 2))));

    const onNext = () => setStartDate(prev => addDays(prev, Math.max(7, Math.floor(daysInView / 2))));

    const onToday = () => {
        const today = startOfDay(new Date());
        setStartDate(today);
        scrollToDate(today);
    };

    // Fit all tasks (compute startDate and daysInView to encompass all tasks but clamp to MAX_DAYS)
    const onFitAll = () => {
        if (filteredTasks.length === 0) return;
        const starts = filteredTasks.map(t => t.assignedAt ? startOfDay(new Date(t.assignedAt)) : null).filter(Boolean);
        const ends = filteredTasks.map(t => t.dueTime ? startOfDay(new Date(t.dueTime)) : (t.completedAt ? startOfDay(new Date(t.completedAt)) : null)).filter(Boolean);
        const minT = starts.length ? starts.reduce((a, b) => (isBefore(a, b) ? a : b)) : startOfDay(new Date());
        const maxT = ends.length ? ends.reduce((a, b) => (isBefore(a, b) ? b : a)) : addDays(minT, DEFAULT_VIEW_DAYS - 1);
        let span = differenceInDays(maxT, minT) + 1;
        if (span > MAX_DAYS) span = MAX_DAYS;
        const buffer = Math.min(5, Math.floor(span * 0.05) + 1);
        const newStart = addDays(minT, -buffer);
        setStartDate(newStart);
        setDaysInView(span + buffer * 2);
    };

    // Auto-center on today or nearest assigned task when data loads
    useEffect(() => {
        if (!startDate || filteredTasks.length === 0) {
            // Initial scroll to today if no tasks are present
            if (!startDate) setStartDate(startOfDay(new Date()));
            scrollToDate(startOfDay(new Date()));
            return;
        }

        // prefer today if visible
        const today = startOfDay(new Date());
        const viewEnd = addDays(startDate, Math.min(daysInView, MAX_DAYS) - 1);

        // This logic ensures that if the view is loaded and today is visible, it centers on today.
        if (!isBefore(viewEnd, today) && !isBefore(today, startDate)) {
            scrollToDate(today);
            return;
        }

        // otherwise nearest assignedAt
        const assignedDates = filteredTasks.map(t => t.assignedAt ? startOfDay(new Date(t.assignedAt)) : null).filter(Boolean);
        if (assignedDates.length === 0) return;
        const closest = assignedDates.reduce((a, b) => (Math.abs(a - new Date()) < Math.abs(b - new Date()) ? a : b));

        // Only jump to a task date if the current view is far from today/minDate
        if (differenceInDays(startDate, today) > DEFAULT_VIEW_DAYS || differenceInDays(startDate, minDate) < 0) {
            scrollToDate(closest);
        }
    }, [startDate, dayWidth, filteredTasks]);

    const today = startOfDay(new Date());
    const todayOffsetDays = differenceInDays(today, startDate);
    const todayLeftPx = todayOffsetDays * dayWidth;
    const showTodayMarker = todayOffsetDays >= 0 && todayOffsetDays < daysInView;

    // Header helpers
    const renderHeader = () => (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, p: 1}}>
            <ButtonGroup variant="outlined" size="small">
                <Button onClick={onPrev}><ArrowBackIcon/></Button>
                <Button onClick={onToday}><TodayIcon/></Button>
                <Button onClick={onNext}><ArrowForwardIcon/></Button>
            </ButtonGroup>
            <Button startIcon={<FitScreenIcon/>} variant="outlined" size="small" onClick={onFitAll}>Fit All</Button>
            <Select variant='outlined' value={zoom} size="small" onChange={(e) => setZoom(e.target.value)}>
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ml: 'auto'}}>
                Zoom: {zoom} • Days view: {Math.min(daysInView, MAX_DAYS)} • Day width: {dayWidth}px
            </Typography>
        </Box>
    );

    return (
        <Paper sx={{width: '100%', borderRadius: 2, overflow: 'hidden'}}>
            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center'}}>
                <Typography variant="h6" fontWeight="bold" sx={{mr: 2}}>Gantt Timeline ({taskPositions.length} tasks
                    visible)</Typography>
                {renderHeader()}
            </Box>
            {filteredTasks.length === 0 ? (
                <Box sx={{p: 8, textAlign: 'center'}}>
                    <Typography color="text.secondary">No tasks to display</Typography>
                </Box>
            ) : (
                <Box ref={containerRef} sx={{overflow: 'auto', maxHeight: '70vh', position: 'relative'}}>

                    {/* Date Headers */}
                    <Box
                        sx={{
                            display: 'flex',
                            borderBottom: 2,
                            borderColor: 'divider',
                            bgcolor: 'grey.50',
                            position: 'sticky',
                            top: 0,
                            zIndex: 3,
                            minWidth: INFO_COL_WIDTH + (dateHeaders.length * dayWidth),
                        }}
                    >
                        {/* Info/Frozen Column */}
                        <Box
                            sx={{
                                minWidth: INFO_COL_WIDTH,
                                p: 2,
                                borderRight: 1,
                                borderColor: 'divider',
                                position: 'sticky',
                                left: 0,
                                zIndex: 4,
                                bgcolor: 'grey.50'
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold">
                                Task / Technician
                            </Typography>
                        </Box>
                        {/* Timeline Dates */}
                        <Box sx={{display: 'flex', width: dateHeaders.length * dayWidth}}>
                            {dateHeaders.map((date, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        width: dayWidth,
                                        p: 1,
                                        borderRight: 1,
                                        borderColor: 'divider',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="caption" display="block" fontWeight="bold">
                                        {format(date, 'MMM dd')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(date, 'EEE')}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Today Marker (Spans all rows) */}
                    {showTodayMarker && (
                        <Box
                            sx={{
                                position: 'absolute',
                                left: INFO_COL_WIDTH + todayLeftPx,
                                top: 0,
                                height: '100%',
                                width: 2,
                                bgcolor: 'red',
                                zIndex: 5,
                                pointerEvents: 'none'
                            }}
                        />
                    )}

                    {/* Task Rows */}
                    {taskPositions.map(({task, leftPx, widthPx}) => (
                        <Box
                            key={task.id}
                            sx={{
                                display: 'flex',
                                borderBottom: 1,
                                borderColor: 'divider',
                                minWidth: INFO_COL_WIDTH + (dateHeaders.length * dayWidth),
                                '&:hover': {bgcolor: 'action.hover'}
                            }}
                        >
                            {/* Info Column (Sticky Left) */}
                            <Box
                                sx={{
                                    minWidth: INFO_COL_WIDTH,
                                    p: 2,
                                    borderRight: 1,
                                    borderColor: 'divider',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 1,
                                    bgcolor: 'inherit'
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {task.motorcyclePlateNumber}
                                    </Typography>
                                    <Chip
                                        label={task.status}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            bgcolor: getStatusColor(task.status),
                                            color: 'white'
                                        }}
                                    />
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    {task.issueType}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getTechnicianName(task.technicianId)}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => onEdit(task)}>
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reassign">
                                        <IconButton size="small" onClick={() => onReassign(task)}>
                                            <ReassignIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => onDelete(task)}>
                                            <DeleteIcon color='error' fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                            {/* Timeline Bar Area */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: 80,
                                    width: dateHeaders.length * dayWidth,
                                    // Repeating gradient creates the daily grid lines
                                    background: `repeating-linear-gradient(
                                        to right,
                                        transparent,
                                        transparent ${dayWidth - 1}px,
                                        #e0e0e0 ${dayWidth - 1}px,
                                        #e0e0e0 ${dayWidth}px
                                    )`
                                }}
                            >
                                {widthPx > 0 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: `${leftPx}px`,
                                            width: `${widthPx}px`,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            height: 32,
                                            bgcolor: getStatusColor(task.status),
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 1,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-50%) scale(1.02)',
                                                boxShadow: 2
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'medium',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {task.issueType}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default TaskGanttView;