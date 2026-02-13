import React, {useState, useMemo} from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Typography,
    Box,
    Tooltip,
    Avatar,
    Stack,
    TableSortLabel
} from '@mui/material';
import {
    Edit as EditIcon,
    SwapHoriz as ReassignIcon,
    Warning as WarningIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {format} from 'date-fns';

function descendingComparator(a, b, orderBy) {
    let aValue;
    let bValue;

    // Handle nested properties (like technician name or motorcycle plate)
    if (orderBy === 'technicianName') {
        aValue = a.technicianName || a.technicianId;
        bValue = b.technicianName || b.technicianId;
    } else if (orderBy === 'motorcyclePlateNumber') {
        aValue = a.motorcyclePlateNumber || a.motorcycleId;
        bValue = b.motorcyclePlateNumber || b.motorcycleId;
    } else {
        aValue = a[orderBy];
        bValue = b[orderBy];
    }

    if (bValue == null) return aValue == null ? 0 : -1;
    if (aValue == null) return 1;

    // Standard comparison
    if (bValue < aValue) {
        return -1;
    }
    if (bValue > aValue) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {id: 'id', label: 'Task ID', sortable: true},
    {id: 'motorcyclePlateNumber', label: 'Motorcycle', sortable: true},
    {id: 'issueType', label: 'Issue Type', sortable: true},
    {id: 'technicianName', label: 'Assigned To', sortable: true},
    {id: 'status', label: 'Status', sortable: true},
    {id: 'priority', label: 'Priority', sortable: true},
    {id: 'dueTime', label: 'Due Date', sortable: true},
    {id: 'assignedAt', label: 'Assigned At', sortable: true},
    {id: 'actions', label: 'Actions', sortable: false, align: 'right'},
];

const TaskQueue = ({
                       tasks,
                       filters,
                       technicians,
                       motorcycles,
                       onEdit,
                       onReassign,
                       onDelete,
                   }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [order, setOrder] = useState('desc'); // 'asc' or 'desc'
    const [orderBy, setOrderBy] = useState('assignedAt'); // Default sort by

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'warning',
            IN_PROGRESS: 'info',
            COMPLETED: 'success',
            CANCELLED: 'error',
            PAUSED: 'default'
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            HIGH: 'error',
            MEDIUM: 'warning',
            LOW: 'info'
        };
        return colors[priority] || 'default';
    };

    const isOverdue = (task) => {
        if (!task.dueTime || task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
        return new Date(task.dueTime) < new Date();
    };

    // Memoized lookups for better performance
    const technicianMap = useMemo(() => {
        return technicians.reduce((map, tech) => {
            map[tech.id] = tech.fullName;
            return map;
        }, {});
    }, [technicians]);

    const motorcyclePlateMap = useMemo(() => {
        return motorcycles?.content?.reduce((map, bike) => {
            map[bike.id] = bike.plateNumber;
            return map;
        }, {}) || {};
    }, [motorcycles]);

    const getTechnicianName = (technicianId) => {
        return technicianMap[technicianId] || 'Unknown';
    };

    const getMotorcyclePlate = (motorcycleId) => {
        return motorcyclePlateMap[motorcycleId] || 'Unknown';
    };

    const sortedFilteredTasks = useMemo(() => {
        const filtered = tasks.filter(task => {
            if (filters.status !== 'all' && task.status !== filters.status) return false;
            if (filters.technicianId && task.technicianId !== filters.technicianId) return false;
            if (filters.motorcycleId && task.motorcycleId !== filters.motorcycleId) return false;

            // Plate Number Search
            if (filters.plateNumber) {
                // Use the task property if available, otherwise look it up
                const plate = (task.motorcyclePlateNumber || motorcyclePlateMap[task.motorcycleId] || '').toLowerCase();
                const searchTerm = filters.plateNumber.toLowerCase();
                if (!plate.includes(searchTerm)) {
                    return false;
                }
            }

            if (filters.dateRange !== 'all' && task.assignedAt) {
                const taskDate = new Date(task.assignedAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (filters.dateRange) {
                    case 'today':
                        if (taskDate.toDateString() !== today.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        if (taskDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        if (taskDate < monthAgo) return false;
                        break;
                }
            }

            return true;
        });

        return stableSort(filtered, getComparator(order, orderBy));

    }, [tasks, filters, order, orderBy, motorcyclePlateMap]);

    const paginatedTasks = sortedFilteredTasks.slice( // Use the sorted and filtered list
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{width: '100%', borderRadius: 2}}>
            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                <Typography variant="h6" fontWeight="bold">
                    Task Queue ({sortedFilteredTasks.length})
                </Typography>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{bgcolor: 'grey.50'}}>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.align || 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.sortable ? (
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => headCell.id !== 'actions' && handleRequestSort(headCell.id)}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{py: 5}}>
                                    <Typography color="text.secondary">
                                        No tasks found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTasks.map((task) => (
                                <TableRow
                                    key={task.id}
                                    hover
                                    sx={{
                                        bgcolor: isOverdue(task) ? 'error.lighter' : 'inherit'
                                    }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2" fontWeight="medium">
                                                {task.id.substring(0, 8)}
                                            </Typography>
                                            {isOverdue(task) && (
                                                <Tooltip title="Overdue">
                                                    <WarningIcon color="error" fontSize="small"/>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {task.motorcyclePlateNumber || getMotorcyclePlate(task.motorcycleId)}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {task.issueType}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar
                                                sx={{width: 32, height: 32, fontSize: '0.875rem'}}
                                            >
                                                {(task.technicianName || getTechnicianName(task.technicianId))
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {task.technicianName || getTechnicianName(task.technicianId)}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={task.status}
                                            size="small"
                                            color={getStatusColor(task.status)}
                                            sx={{fontWeight: 'medium'}}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={task.priority || 'MEDIUM'}
                                            size="small"
                                            color={getPriorityColor(task.priority)}
                                            variant="outlined"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {task.dueTime ? (
                                            <Typography
                                                variant="body2"
                                                color={isOverdue(task) ? 'error' : 'text.primary'}
                                            >
                                                {format(new Date(task.dueTime), 'MMM dd, yyyy HH:mm')}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Not set
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {task.assignedAt
                                                ? format(new Date(task.assignedAt), 'MMM dd, yyyy')
                                                : 'N/A'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit Task">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(task)}
                                                    color="primary"
                                                >
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Reassign Task">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onReassign(task)}
                                                    color="secondary"
                                                >
                                                    <ReassignIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Task">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(task)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={sortedFilteredTasks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default TaskQueue;