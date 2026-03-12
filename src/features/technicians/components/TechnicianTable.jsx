import React, {useState, useMemo} from 'react';
import {
    Paper,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Avatar,
    Button,
    TablePagination,
    TableSortLabel
} from '@mui/material';
import {
    Visibility,
    Assignment,
    ToggleOn,
    ToggleOff,
    Download
} from '@mui/icons-material';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// --- Sorting Helper Functions ---
function descendingComparator(a, b, orderBy) {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle special case for the "Technician" column which might fall back to username
    if (orderBy === 'fullName') {
        aValue = (a.fullName || a.username || '').toLowerCase();
        bValue = (b.fullName || b.username || '').toLowerCase();
    } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
    }

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

// --- Table Configuration ---
const headCells = [
    {id: 'id', label: 'ID', sortable: true},
    {id: 'fullName', label: 'Technician', sortable: true},
    {id: 'speciality', label: 'Speciality', sortable: true},
    {id: 'email', label: 'Email', sortable: true},
    {id: 'phoneNumber', label: 'Phone', sortable: true},
    {id: 'status', label: 'Status', sortable: true},
    {id: 'activeTasks', label: 'Active Tasks', sortable: true},
    {id: 'completedTasks', label: 'Completed Tasks', sortable: true},
    {id: 'actions', label: 'Actions', sortable: false},
];

const TechnicianTable = ({
                             technicians,
                             loading,
                             onViewDetails,
                             onAssignTask,
                             onToggleStatus,
                             performanceData
                         }) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('fullName');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStatusColor = (status) => {
        return status ? 'success' : 'default';
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase()
            : '?';
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Sort and then paginate
    const visibleRows = useMemo(() => {
        return stableSort(technicians, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [technicians, order, orderBy, page, rowsPerPage]);

    const handleGenerateReport = () => {
        const csv = generateCSVReport(technicians);
        downloadCSV(csv, `technician-performance-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const generateCSVReport = (data) => {
        const headers = [
            'ID',
            'Name',
            'Username',
            'Email',
            'Phone',
            'Status',
            'Active Tasks',
            'Completed Tasks',
            'Avg Completion Time (hrs)',
            'Efficiency Score',
            'On-Time Rate (%)'
        ];

        const rows = data.map(tech => {
            const perf = performanceData.find(p => p.technicianId === tech.id) || {};
            return [
                tech.id,
                tech.fullName || '',
                tech.username,
                tech.email,
                tech.phoneNumber || '',
                tech.status ? 'Online' : 'Offline',
                tech.activeTasks || 0,
                tech.completedTasks || perf.totalTasksCompleted || 0,
                tech.averageCompletionTimeHours?.toFixed(2) || perf.averageCompletionTimeHours?.toFixed(2) || 'N/A',
                perf.efficiencyScore?.toFixed(1) || 'N/A',
                perf.onTimeCompletionRate?.toFixed(1) || 'N/A'
            ];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) <LoadingSpinner/>

    return (
        <Paper sx={{width: '100%'}}>
            <Box sx={{p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6">Technician List</Typography>
                <Button
                    variant="outlined"
                    startIcon={<Download/>}
                    onClick={handleGenerateReport}
                    disabled={technicians.length === 0}
                >
                    Export CSV
                </Button>
            </Box>
            <TableContainer sx={{maxHeight: 440}}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.sortable ? (
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(headCell.id)}
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
                        {technicians.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={headCells.length} align="center">
                                    No technicians found
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((tech) => (
                                <TableRow key={tech.id} hover>
                                    <TableCell size='small'>{tech.id?.substring(0, 8)}</TableCell>
                                    <TableCell size='small'>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Avatar
                                                sx={{width: 32, height: 32}}
                                                src={tech.photoUrl}
                                            >
                                                {getInitials(tech.fullName || tech.username)}
                                            </Avatar>
                                            <Typography>
                                                {tech.fullName || tech.username}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell size='small'>{tech?.speciality}</TableCell>
                                    <TableCell size='small'>{tech.email}</TableCell>
                                    <TableCell size='small'>{tech.phoneNumber || 'N/A'}</TableCell>
                                    <TableCell size='small'>
                                        <Chip
                                            label={tech.status ? 'Online' : 'Offline'}
                                            color={getStatusColor(tech.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell size='small'>{tech.activeTasks || 0}</TableCell>
                                    <TableCell size='small'>{tech.completedTasks || 0}</TableCell>
                                    <TableCell size='small' sx={{minWidth: 150}}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => onViewDetails(tech)}
                                            title="View Details"
                                        >
                                            <Visibility/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="secondary"
                                            onClick={() => onAssignTask(tech)}
                                            title="Assign Task"
                                        >
                                            <Assignment/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => onToggleStatus(tech.id)}
                                            title="Toggle Status"
                                        >
                                            {tech.status ? <ToggleOn color="success"/> : <ToggleOff/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={technicians.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default TechnicianTable;