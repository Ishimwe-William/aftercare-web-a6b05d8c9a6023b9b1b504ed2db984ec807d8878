import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Alert,
    Card,
    CardContent,
    Stack,
    Checkbox,
    Menu,
    useMediaQuery,
    createTheme,
    TableSortLabel,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    MoreVert,
    VpnKey,
} from '@mui/icons-material';
import {useDispatch, useSelector} from 'react-redux';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
} from '../userSlice';
import {forgotPassword} from '../../auth/authSlice';
import {useAuth} from '../../auth/hooks/useAuth';
import {formatDate} from '../../../utils/dateUtils';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const theme = createTheme();
const SYSTEM_EMAIL = 'system@bunsen.com';

function descendingComparator(a, b, orderBy) {
    const valA = getValueByKey(a, orderBy);
    const valB = getValueByKey(b, orderBy);

    if (valB < valA) {
        return -1;
    }
    if (valB > valA) {
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

function getValueByKey(user, key) {
    if (key === 'roles') {
        return user.roles?.[0] || '';
    }
    if (key === 'enabled') {
        return user.enabled ? 1 : 0;
    }
    if (key === 'status') {
        return user.status ? 1 : 0;
    }
    if (key === 'createdAt') {
        return new Date(user.createdAt);
    }
    return user[key];
}

const UserManagementSection = () => {
    const dispatch = useDispatch();
    const {user: currentUser} = useAuth();
    const {users, status} = useSelector(state => state.users);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState({type: '', text: ''});
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuUser, setMenuUser] = useState(null);

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        roles: ['ROLE_STAFF'],
        enabled: true
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    const isProtectedUser = (user) => {
        return user.id === currentUser?.id || user.email === SYSTEM_EMAIL;
    };

    const handleOpenDialog = (mode, user = null) => {
        setDialogMode(mode);
        setSelectedUser(user);

        if (mode === 'edit' && user) {
            setFormData({
                username: user.username,
                email: user.email,
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                roles: user.roles || ['ROLE_STAFF'],
                status: user.status
            });
        } else {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                phoneNumber: '',
                roles: ['ROLE_STAFF'],
                status: true
            });
        }

        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setMessage({type: '', text: ''});
    };

    const handleFormChange = (field, value) => {
        setFormData({...formData, [field]: value});
    };

    const handleSubmit = async () => {
        setMessage({type: '', text: ''});

        try {
            if (dialogMode === 'create') {
                await dispatch(createUser(formData)).unwrap();
                setMessage({type: 'success', text: 'User created successfully!'});
            } else {
                await dispatch(updateUser({
                    id: selectedUser.id,
                    userData: formData
                })).unwrap();
                setMessage({type: 'success', text: 'User updated successfully!'});
            }

            setTimeout(() => {
                handleCloseDialog();
                dispatch(fetchUsers());
            }, 1500);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err || 'Operation failed'
            });
        }
    };

    const handleDelete = async (id) => {
        const user = users.find(u => u.id === id);
        if (isProtectedUser(user)) {
            alert('You cannot delete this user');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                dispatch(fetchUsers());
            } catch (err) {
                alert(`Failed to delete user: ${err}`);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        const user = users.find(u => u.id === id);
        if (isProtectedUser(user)) {
            alert('You cannot toggle this user status');
            return;
        }

        try {
            await dispatch(toggleUserStatus(id)).unwrap();
        } catch (err) {
            alert(`Failed to toggle status: ${err}`);
        }
    };

    const handleResetPassword = async (user) => {
        if (window.confirm(`Send password reset link to ${user.email}?`)) {
            try {
                await dispatch(forgotPassword(user.email)).unwrap();
                alert('Password reset link sent');
            } catch (err) {
                alert(`Failed to send reset link: ${err}`);
            }
        }
    };

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setMenuUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUser(null);
    };

    const handleSelectUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (isProtectedUser(user)) return;

        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const selectableUsers = paginatedUsers
                .filter(u => !isProtectedUser(u))
                .map(u => u.id);
            setSelectedUsers(selectableUsers);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;

        if (window.confirm(`Delete ${selectedUsers.length} users?`)) {
            for (const id of selectedUsers) {
                const user = users.find(u => u.id === id);
                if (!isProtectedUser(user)) {
                    try {
                        await dispatch(deleteUser(id)).unwrap();
                    } catch (err) {
                        console.error(`Failed to delete user ${id}:`, err);
                    }
                }
            }
            setSelectedUsers([]);
            dispatch(fetchUsers());
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = sortBy === property && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };

    const filteredUsers = users.filter(user =>
        Object.values(user).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const sortedUsers = useMemo(() => {
        return stableSort(filteredUsers, getComparator(sortDirection, sortBy));
    }, [filteredUsers, sortDirection, sortBy]);

    const paginatedUsers = sortedUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (status === 'loading') return <LoadingSpinner/>

    const renderMobileCards = () => (
        <Box>
            {paginatedUsers.map((user) => (
                <Card key={user.id} sx={{mb: 2}}>
                    <CardContent>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                            <Box>
                                <Typography variant="h6" sx={{fontSize: '1rem'}}>
                                    {user.fullName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Box>
                            {!isProtectedUser(user) && (
                                <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                    <MoreVert/>
                                </IconButton>
                            )}
                        </Box>

                        <Stack spacing={1}>
                            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                <Chip
                                    label={user.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={user.enabled ? 'Active' : 'Disabled'}
                                    size="small"
                                    color={user.enabled ? 'success' : 'error'}
                                    onClick={() => handleToggleStatus(user.id)}
                                    disabled={isProtectedUser(user)}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(user.createdAt)}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );

    const selectableCount = paginatedUsers.filter(u => !isProtectedUser(u)).length;
    const allSelectableSelected = selectableCount > 0 &&
        selectedUsers.length === selectableCount;

    const renderDesktopTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={allSelectableSelected}
                                indeterminate={selectedUsers.length > 0 && !allSelectableSelected}
                                onChange={handleSelectAll}
                            />
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'fullName'}
                                direction={sortBy === 'fullName' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('fullName')}
                            >
                                Full Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'email'}
                                direction={sortBy === 'email' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('email')}
                            >
                                Email
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'roles'}
                                direction={sortBy === 'roles' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('roles')}
                            >
                                Role
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'status'}
                                direction={sortBy === 'status' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('status')}
                            >
                                Status
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'enabled'}
                                direction={sortBy === 'enabled' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('enabled')}
                            >
                                Verified
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'createdAt'}
                                direction={sortBy === 'createdAt' ? sortDirection : 'asc'}
                                onClick={() => handleRequestSort('createdAt')}
                            >
                                Created
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedUsers.map((user) => {
                        const protected_ = isProtectedUser(user);
                        return (
                            <TableRow key={user.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleSelectUser(user.id)}
                                        disabled={protected_}
                                    />
                                </TableCell>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status ? 'Active' : 'Disabled'}
                                        size="small"
                                        color={user.status ? 'success' : 'error'}
                                        onClick={() => handleToggleStatus(user.id)}
                                        disabled={protected_}
                                        sx={{cursor: protected_ ? 'default' : 'pointer'}}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.enabled ? 'Yes' : 'No'}
                                        size="small"
                                        color={user.enabled ? 'success' : 'warning'}
                                    />
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell align="right" sx={{minWidth: 150}}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog('edit', user)}
                                        disabled={protected_}
                                    >
                                        <Edit/>
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleResetPassword(user)}
                                        disabled={protected_}
                                    >
                                        <VpnKey/>
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={protected_}
                                    >
                                        <Delete/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {paginatedUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No users found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: {xs: 'column', sm: 'row'},
                gap: 2,
                mb: 3
            }}>
                <Typography variant="h5" fontWeight="bold">
                    User Management
                </Typography>
                <Box sx={{display: 'flex', gap: 1}}>
                    {selectedUsers.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete/>}
                            onClick={handleBulkDelete}
                            size="small"
                        >
                            Delete ({selectedUsers.length})
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add/>}
                        onClick={() => handleOpenDialog('create')}
                        size="small"
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            <TextField
                fullWidth
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                }}
                sx={{mb: 3}}
                InputProps={{
                    startAdornment: <Search sx={{mr: 1, color: 'text.secondary'}}/>
                }}
            />

            {isMobile ? renderMobileCards() : renderDesktopTable()}

            <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenDialog('edit', menuUser);
                    handleMenuClose();
                }}>
                    <Edit sx={{mr: 1}}/> Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    handleResetPassword(menuUser);
                    handleMenuClose();
                }}>
                    <VpnKey sx={{mr: 1}}/> Reset Password
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleDelete(menuUser.id);
                        handleMenuClose();
                    }}
                >
                    <Delete sx={{mr: 1}}/> Delete
                </MenuItem>
            </Menu>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
                </DialogTitle>
                <DialogContent>
                    {message.text && (
                        <Alert severity={message.type} sx={{mb: 2}}>
                            {message.text}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={(e) => handleFormChange('username', e.target.value)}
                                disabled={dialogMode === 'edit'}
                                required
                                helperText={dialogMode === 'create' ? 'Cannot be changed later' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                disabled={dialogMode === 'edit'}
                                required
                                helperText={dialogMode === 'create' ? 'Cannot be changed later' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(e) => handleFormChange('fullName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    variant='outlined'
                                    value={formData.roles[0] || 'ROLE_STAFF'}
                                    onChange={(e) => handleFormChange('roles', [e.target.value])}
                                    label="Role"
                                >
                                    <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                                    <MenuItem value="ROLE_SUPERVISOR">Supervisor</MenuItem>
                                    <MenuItem value="ROLE_TECHNICIAN">Technician</MenuItem>
                                    <MenuItem value="ROLE_STAFF">Staff</MenuItem>
                                    <MenuItem value="ROLE_MANAGER">Manager</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {dialogMode === 'create' && (
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    Default password will be set. User will receive an email to set their password.
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                    >
                        {dialogMode === 'create' ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagementSection;