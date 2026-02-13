import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import { Save, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIssues,
    createIssue,
    updateIssuePrice,
    deleteIssue,
    clearIssuesError
} from '../issuesSlice';

const IssuesManagementSection = () => {
    const dispatch = useDispatch();
    const { issues, isLoading, error } = useSelector(state => state.issues);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [issueName, setIssueName] = useState('');
    const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingPrices, setEditingPrices] = useState({});
    const [savingPrices, setSavingPrices] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchIssues());
    }, [dispatch]);

    const handleOpenDialog = (issue = null) => {
        if (issue) {
            setEditingId(issue.id);
            setIssueName(issue.name);
            setPrice(issue.price.toString());
        } else {
            setEditingId(null);
            setIssueName('');
            setPrice('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setIssueName('');
        setPrice('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!issueName.trim()) {
            dispatch(clearIssuesError());
            dispatch({
                type: 'issues/error',
                payload: 'Please enter an issue name'
            });
            return;
        }

        if (!price || parseFloat(price) < 0) {
            dispatch(clearIssuesError());
            dispatch({
                type: 'issues/error',
                payload: 'Please enter a valid price'
            });
            return;
        }

        setSubmitting(true);

        try {
            if (editingId) {
                // Update existing issue
                await dispatch(updateIssuePrice({
                    id: editingId,
                    price: parseFloat(price)
                }));
            } else {
                // Create new issue
                await dispatch(createIssue({
                    name: issueName.trim(),
                    price: parseFloat(price)
                }));
            }
            handleCloseDialog();
            dispatch(fetchIssues());
        } catch (error) {
            console.error('Error saving issue:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePriceChange = (id, newPrice) => {
        setEditingPrices({
            ...editingPrices,
            [id]: newPrice
        });
    };

    const handleSavePrice = async (id, originalPrice) => {
        const newPrice = editingPrices[id];

        if (!newPrice || parseFloat(newPrice) < 0) {
            alert('Please enter a valid price');
            return;
        }

        if (parseFloat(newPrice) === originalPrice) {
            setEditingPrices({
                ...editingPrices,
                [id]: undefined
            });
            return;
        }

        setSavingPrices({ ...savingPrices, [id]: true });

        try {
            await dispatch(updateIssuePrice({
                id,
                price: parseFloat(newPrice)
            })).unwrap();

            setEditingPrices({
                ...editingPrices,
                [id]: undefined
            });
        } catch (error) {
            alert('Failed to update price: ' + error);
        } finally {
            setSavingPrices({ ...savingPrices, [id]: false });
        }
    };

    const handleDeleteIssue = async (id) => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            try {
                await dispatch(deleteIssue(id)).unwrap();
                dispatch(fetchIssues());
            } catch (error) {
                alert('Failed to delete issue: ' + error);
            }
        }
    };

    const filteredIssues = issues?.filter(issue =>
        issue.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Electric Bike Known Issues Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New Issue
                </Button>
            </Box>

            <Box mb={3}>
                <TextField
                    fullWidth
                    placeholder="Search issues by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearIssuesError())}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Issue Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price (RWF)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredIssues && filteredIssues.length > 0 ? (
                                filteredIssues.map((issue) => (
                                    <TableRow key={issue.id} hover>
                                        <TableCell>{issue.name}</TableCell>
                                        <TableCell align="right">
                                            {editingPrices[issue.id] !== undefined ? (
                                                <Box display="flex" gap={1} justifyContent="flex-end">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={editingPrices[issue.id]}
                                                        onChange={(e) => handlePriceChange(issue.id, e.target.value)}
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{ width: 120 }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleSavePrice(issue.id, issue.price)}
                                                        disabled={savingPrices[issue.id]}
                                                    >
                                                        {savingPrices[issue.id] ? <CircularProgress size={20} /> : <Save />}
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography>{issue.price.toFixed(2)}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => {
                                                    setEditingPrices({
                                                        ...editingPrices,
                                                        [issue.id]: issue.price.toString()
                                                    });
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteIssue(issue.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No issues found. Create one to get started!
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Issue Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Edit Issue' : 'Create New Issue'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        label="Issue Name"
                        placeholder="e.g., Battery Not Charging"
                        value={issueName}
                        onChange={(e) => setIssueName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Price (RWF)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IssuesManagementSection;