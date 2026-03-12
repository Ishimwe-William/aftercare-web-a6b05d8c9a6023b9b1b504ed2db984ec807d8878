import React, {useState, useMemo} from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Chip,
    Box,
    LinearProgress,
    Typography,
    IconButton,
    TablePagination,
    TableFooter,
    TableSortLabel
} from '@mui/material';
import {Visibility, SwapHoriz, Receipt} from '@mui/icons-material';

// --- Sorting Helper Functions ---
function descendingComparator(a, b, orderBy) {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle nested properties
    if (orderBy === 'motorcycle') {
        aValue = a.motorcycle?.plateNumber || '';
        bValue = b.motorcycle?.plateNumber || '';
    }

    if (bValue < aValue) {
        return -1;
    }
    if (bValue > aValue) {
        return 1;
    }
    return 0;
}

const getComparator = (order, orderBy) => order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

const stableSort = (array, comparator) => {
    let stabilizedThis;
    stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
};

// --- Table Header Configuration ---
const headCells = [
    {id: 'caseId', label: 'Case ID', sortable: true},
    {id: 'motorcycle', label: 'Motorcycle', sortable: true},
    {id: 'issueType', label: 'Issue', sortable: true},
    {id: 'issue', label: 'Description', sortable: true},
    {id: 'technician', label: 'Technician', sortable: true},
    {id: 'status', label: 'Status', sortable: true},
    {id: 'progress', label: 'Progress', sortable: true},
    {id: 'priority', label: 'Priority', sortable: true},
    {id: 'createdAt', label: 'Created At', sortable: true},
    {id: 'actions', label: 'Actions', sortable: false},
];

const CasesTableView = ({
                            cases,
                            onView,
                            onReassign,
                            totalCases,
                            page,
                            rowsPerPage,
                            onPageChange,
                            onRowsPerPageChange,
                            onGenerateInvoice
                        }) => {
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStatusColor = (status) => {
        const colors = {PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error'};
        return colors[status] || 'default';
    };

    // Apply sorting to the cases array
    const sortedCases = useMemo(() => {
        return stableSort(cases, getComparator(order, orderBy));
    }, [cases, order, orderBy]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                sortDirection={orderBy === headCell.id ? order : false}
                                align={headCell.id === 'actions' ? 'left' : 'inherit'}
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
                    {sortedCases.map(c => (
                        <TableRow key={c.caseId} hover>
                            <TableCell>{c.caseId?.substring(0, 8)}</TableCell>
                            <TableCell>{c.motorcycle.plateNumber}</TableCell>
                            <TableCell>{c.issueType}</TableCell>
                            <TableCell>{c.issue}</TableCell>
                            <TableCell>{c.technician}</TableCell>
                            <TableCell>
                                <Chip label={c.status} color={getStatusColor(c.status)} size="small"/>
                            </TableCell>
                            <TableCell>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <LinearProgress variant="determinate" value={c.progress}
                                                    sx={{flex: 1, height: 8, borderRadius: 4}}/>
                                    <Typography variant="body2">{c.progress}%</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip label={c.priority || 'N/A'} size="small"
                                      color={c.priority === 'HIGH' ? 'error' : c.priority === 'MEDIUM' ? 'warning' : 'default'}/>
                            </TableCell>
                            <TableCell>{c.createdAt?.substring(0, c.createdAt?.indexOf('T'))}</TableCell>
                            <TableCell align="left" sx={{minWidth: 130,}}>
                                <IconButton
                                    size="small"
                                    onClick={() => onView(c)}
                                    title="View Task Details"
                                >
                                    <Visibility fontSize="small"/>
                                </IconButton>
                                <IconButton
                                    disabled={c.status === 'COMPLETED'}
                                    size="small"
                                    onClick={() => onReassign(c)}
                                    title="Reassign Technician"
                                >
                                    <SwapHoriz fontSize="small"/>
                                </IconButton>
                                {c.status === 'COMPLETED' && (
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => onGenerateInvoice(c)}
                                        title="Generate/View Invoice"
                                    >
                                        <Receipt fontSize="small"/>
                                    </IconButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, {label: 'All', value: -1}]}
                            colSpan={9}
                            count={totalCases}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            slotProps={{
                                select: {
                                    inputProps: {
                                        'aria-label': 'rows per page',
                                    },
                                    native: true,
                                },
                            }}
                            onPageChange={onPageChange}
                            onRowsPerPageChange={onRowsPerPageChange}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
};

export default CasesTableView;