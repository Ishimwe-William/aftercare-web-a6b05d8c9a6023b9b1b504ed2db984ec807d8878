import React, {useState, useMemo} from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    TableSortLabel // <--- NEW IMPORT
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon
} from '@mui/icons-material';
import {useVehicleFilters} from '../hooks/useVehicleFilters';


function descendingComparator(a, b, orderBy) {
    const aValue = orderBy.startsWith('owner') ? a.ownerName : a[orderBy];
    const bValue = orderBy.startsWith('owner') ? b.ownerName : b[orderBy];

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

// Stable sort function to maintain original order for equal elements
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

const statusColors = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    IN_SERVICE: 'warning',
};

// Define column headers and the associated property for sorting
const headCells = [
    {id: 'qrCode', label: 'Barcode', sortable: true},
    {id: 'model', label: 'Model', sortable: true},
    {id: 'plateNumber', label: 'Plate Number', sortable: true},
    {id: 'ownerName', label: 'Owner', sortable: true},
    {id: 'status', label: 'Status', sortable: true},
    {id: 'needsService', label: 'Service Status', sortable: true},
    {id: 'lastServiceDate', label: 'Last Service', sortable: true},
    {id: 'actions', label: 'Actions', sortable: false, align: 'right'},
];

const VehicleTable = ({motorcycles, onEdit, onDelete}) => {
    const {searchQuery, statusFilter} = useVehicleFilters();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
    const [orderBy, setOrderBy] = useState('qrCode'); // the property being sorted

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedFilteredMotorcycles = useMemo(() => {
        const filtered = motorcycles.filter((motorcycle) => {
            const matchesSearch =
                motorcycle.qrCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                motorcycle.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                motorcycle.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                motorcycle.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || motorcycle.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return stableSort(filtered, getComparator(order, orderBy));

    }, [motorcycles, searchQuery, statusFilter, order, orderBy]); // Add sort state as dependencies

    const paginatedMotorcycles = useMemo(() => {
        return sortedFilteredMotorcycles.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedFilteredMotorcycles, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Card>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
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
                        {paginatedMotorcycles.length === 0 ? (
                            <TableRow>
                                {/* Adjusted colspan to 8 */}
                                <TableCell colSpan={8} align="center">
                                    <Typography color="textSecondary">
                                        No motorcycles found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedMotorcycles.map((motorcycle) => (
                                <TableRow key={motorcycle.id} hover>
                                    <TableCell>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <QrCodeIcon fontSize="small"/>
                                            {motorcycle.qrCode}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{motorcycle.model}</TableCell>
                                    <TableCell>{motorcycle.plateNumber || '-'}</TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2">{motorcycle.ownerName || '-'}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {motorcycle.ownerPhone || '-'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={motorcycle.status}
                                            color={statusColors[motorcycle.status]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {motorcycle.needsService ? (
                                            <Chip label="Needs Service" color="error" size="small"/>
                                        ) : (
                                            <Chip label="Up to Date" color="success" size="small"/>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {motorcycle.lastServiceDate
                                            ? new Date(motorcycle.lastServiceDate).toLocaleDateString()
                                            : 'Never'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => onEdit(motorcycle)}
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => onDelete(motorcycle.id)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={sortedFilteredMotorcycles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Card>
    );
};

export default VehicleTable;