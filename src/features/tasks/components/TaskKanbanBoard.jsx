import React from 'react';
import {useDispatch} from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    SwapHoriz as ReassignIcon,
    Warning as WarningIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {format} from 'date-fns';
import {updateTaskStatus} from '../taskAssignmentSlice';

const TaskKanbanBoard = ({
                             tasks,
                             filters,
                             technicians,
                             onEdit,
                             onReassign,
                             onRefresh,
                             onDelete
                         }) => {
    const dispatch = useDispatch();

    const columns = [
        {id: 'PENDING', title: 'Pending', color: '#FFA726'},
        {id: 'IN_PROGRESS', title: 'In Progress', color: '#42A5F5'},
        {id: 'PAUSED', title: 'Paused', color: '#9E9E9E'},
        {id: 'COMPLETED', title: 'Completed', color: '#66BB6A'},
        {id: 'CANCELLED', title: 'Cancelled', color: '#EF5350'}
    ];

    const isOverdue = (task) => {
        if (!task.dueTime || task.status === 'COMPLETED') return false;
        return new Date(task.dueTime) < new Date();
    };

    const getTechnicianName = (technicianId) => {
        const tech = technicians.find(t => t.id === technicianId);
        return tech ? tech.fullName : 'Unknown';
    };

    const filteredTasks = tasks.filter(task => {
        if (filters.technicianId && task.technicianId !== filters.technicianId) return false;
        if (filters.motorcycleId && task.motorcycleId !== filters.motorcycleId) return false;
        return true;
    });

    const getTasksByStatus = (status) => {
        return filteredTasks.filter(task => task.status === status);
    };

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('currentStatus', task.status);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const currentStatus = e.dataTransfer.getData('currentStatus');

        if (currentStatus !== newStatus) {
            try {
                await dispatch(updateTaskStatus({
                    taskId,
                    statusData: {status: newStatus}
                })).unwrap();
                onRefresh();
            } catch (error) {
                console.error('Failed to update task status:', error);
            }
        }
    };

    return (
        <Box sx={{display: 'flex', gap: 2, overflowX: 'auto', pb: 2}}>
            {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);

                return (
                    <Paper
                        key={column.id}
                        sx={{
                            minWidth: 300,
                            maxWidth: 350,
                            flex: '1 1 auto',
                            borderRadius: 2,
                            bgcolor: 'grey.50'
                        }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: 3,
                                borderColor: column.color,
                                bgcolor: 'white'
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight="bold">
                                    {column.title}
                                </Typography>
                                <Chip
                                    label={columnTasks.length}
                                    size="small"
                                    sx={{
                                        bgcolor: column.color,
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Stack>
                        </Box>

                        {/* Cards Container */}
                        <Box sx={{p: 2, minHeight: 400, maxHeight: 600, overflowY: 'auto'}}>
                            <Stack spacing={2}>
                                {columnTasks.length === 0 ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        align="center"
                                        sx={{py: 4}}
                                    >
                                        No tasks
                                    </Typography>
                                ) : (
                                    columnTasks.map((task) => (
                                        <Card
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            sx={{
                                                cursor: 'grab',
                                                '&:active': {cursor: 'grabbing'},
                                                border: isOverdue(task) ? 2 : 0,
                                                borderColor: 'error.main',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    boxShadow: 4,
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{pb: 1}}>
                                                {/* Task ID and Overdue Warning */}
                                                <Stack direction="row" justifyContent="space-between"
                                                       alignItems="center" mb={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {task.id.substring(0, 8)}
                                                    </Typography>
                                                    {isOverdue(task) && (
                                                        <Tooltip title="Overdue">
                                                            <WarningIcon color="error" fontSize="small"/>
                                                        </Tooltip>
                                                    )}
                                                </Stack>

                                                {/* Motorcycle */}
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                    {task.motorcyclePlateNumber}
                                                </Typography>

                                                {/* Issue Type */}
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {task.issueType}
                                                </Typography>

                                                {/* Description */}
                                                {task.description && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mb: 1
                                                        }}
                                                    >
                                                        {task.description}
                                                    </Typography>
                                                )}

                                                {/* Technician */}
                                                <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                                                    <Avatar sx={{width: 28, height: 28, fontSize: '0.75rem'}}>
                                                        {getTechnicianName(task.technicianId).charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="caption">
                                                        {getTechnicianName(task.technicianId)}
                                                    </Typography>
                                                </Stack>

                                                {/* Due Date */}
                                                {task.dueTime && (
                                                    <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                                                        <TimeIcon fontSize="small"
                                                                  color={isOverdue(task) ? 'error' : 'action'}/>
                                                        <Typography
                                                            variant="caption"
                                                            color={isOverdue(task) ? 'error' : 'text.secondary'}
                                                        >
                                                            {format(new Date(task.dueTime), 'MMM dd, HH:mm')}
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {/* Priority Badge */}
                                                {task.priority && (
                                                    <Chip
                                                        label={task.priority}
                                                        size="small"
                                                        color={
                                                            task.priority === 'HIGH' ? 'error' :
                                                                task.priority === 'MEDIUM' ? 'warning' : 'info'
                                                        }
                                                        sx={{mt: 1, height: 20, fontSize: '0.7rem'}}
                                                    />
                                                )}
                                            </CardContent>

                                            <CardActions sx={{justifyContent: 'flex-end', pt: 0}}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(task)}
                                                        color="primary"
                                                    >
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reassign">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onReassign(task)}
                                                        color="secondary"
                                                    >
                                                        <ReassignIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(task)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    ))
                                )}
                            </Stack>
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};

export default TaskKanbanBoard;