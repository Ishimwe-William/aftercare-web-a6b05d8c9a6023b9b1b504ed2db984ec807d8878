import React, {useEffect, useState, forwardRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Box,
    Button, Paper, Alert, TextField, Grid, Divider, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Autocomplete, FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import {generateInvoiceHTMLWeb} from '../../../components/invoiceHTMLGenerator';
import {
    generateInvoice, clearCurrentInvoice, clearInvoiceError, fetchTaskInvoices
} from '../../../store/slices/invoiceSlice';
import {
    fetchTaskParts,
    clearTaskParts,
    updatePartUsage,
    logPartUsage,
    updateTaskStatus
} from '../../tasks/taskAssignmentSlice';
import {fetchCaseDetails} from "../monitoringThunks";
import {fetchInventory} from '../../inventory/inventorySlice';
import {fetchIssues} from '../../settings/issuesSlice';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const safeParseNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

const InvoicePreviewDialog = ({open, onClose, caseId, preloadedCaseDetails = null, currentInvoice, laborRate}) => {
    const dispatch = useDispatch();
    const {isLoading: invoiceLoading, error: invoiceError, currentInvoice: storeInvoice} = useSelector(s => s.invoice);
    const caseFromStore = useSelector(s => s.monitoring?.currentCase);
    const {parts: availableParts} = useSelector(s => s.inventory);
    const {currentTaskParts} = useSelector(s => s.tasks);
    const {issues} = useSelector(s => s.issues);

    const [htmlContent, setHtmlContent] = useState('');
    const [showGenerateForm, setShowGenerateForm] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        laborHours: 0,
        issueCost: 0,
        selectedIssue: null,
        selectedParts: [],
        discount: 0,
        discountType: 'fixed',
        notes: ''
    });

    const effectiveInvoice = currentInvoice || storeInvoice;
    const effectiveCase = preloadedCaseDetails || caseFromStore;

    useEffect(() => {
        if (!open) {
            resetState();
            return;
        }

        if (!caseId) return;

        dispatch(fetchTaskInvoices(caseId));
        dispatch(fetchTaskParts(caseId));
        dispatch(fetchInventory({page: 0, size: 1000}));
        dispatch(fetchIssues());
        if (!preloadedCaseDetails) dispatch(fetchCaseDetails(caseId));
    }, [open, caseId, preloadedCaseDetails, dispatch]);

    useEffect(() => {
        const task = effectiveCase?.caseInfo || effectiveCase;
        if (!task) return;

        if (effectiveInvoice) {
            generateInvoicePreview(effectiveInvoice, task);
            setShowGenerateForm(false);
        } else if (!invoiceLoading && !invoiceError) {
            initializeForm(task, currentTaskParts);
        }
    }, [effectiveInvoice, effectiveCase, invoiceLoading, invoiceError, laborRate, currentTaskParts]);

    const resetState = () => {
        setHtmlContent('');
        setShowGenerateForm(false);
        setIsGenerating(false);
        setFormData({
            laborHours: 0,
            issueCost: 0,
            selectedIssue: null,
            selectedParts: [],
            discount: 0,
            discountType: 'fixed',
            notes: ''
        });
        dispatch(clearCurrentInvoice());
        dispatch(clearInvoiceError());
        dispatch(clearTaskParts());
    };

    const initializeForm = (task, assignedParts = []) => {
        const mappedParts = assignedParts.map(p => ({
            usageId: p.usageId || p.id,
            id: p.partId,
            name: p.partName || p.name,
            cost: safeParseNumber(p.cost, 0),
            quantity: safeParseNumber(p.quantityUsed || p.quantity, 1)
        }));

        // Find matching issue based on task's issueType
        const matchingIssue = issues.find(issue => issue.name === task.issueType);

        setFormData({
            laborHours: safeParseNumber(task.laborHours),
            issueCost: matchingIssue ? safeParseNumber(matchingIssue.price, 0) : safeParseNumber(task.issueCost, 0),  // Auto-fill issueCost from matching issue's price or task's issueCost
            selectedIssue: matchingIssue || null,  // Auto-fill selectedIssue if match found
            selectedParts: mappedParts,
            discount: 0,
            discountType: 'fixed',
            notes: task.notes || ''
        });
        setShowGenerateForm(true);
    };

    const generateInvoicePreview = (invoice, task) => {
        const mappedTaskData = {
            motorcycleModel: task.motorcycle?.model,
            motorcyclePlateNumber: task.motorcycle?.plateNumber,
            technicianName: task.technician,
            issueType: task.issueType,
            laborHours: invoice.laborHours || task.laborHours
        };

        // FIXED: Extract parts from either 'lineItems' (backend DTO) or 'items' (local/old state)
        // and normalize properties for the calculator (unitCost -> cost, quantityUsed -> quantity)
        const rawParts = invoice.lineItems || invoice.items || [];
        const normalizedParts = rawParts.map(p => ({
            ...p,
            cost: p.cost ?? p.unitCost, // Handle DTO field mismatch
            quantity: p.quantity ?? p.quantityUsed
        }));

        const calculations = calculateTotals({
            issueCost: invoice?.issueCost || task?.issueCost,
            selectedParts: normalizedParts,
            discount: invoice.discount || 0,
            discountType: 'fixed'
        });

        const html = generateInvoiceHTMLWeb(
            invoice,
            calculations,
            mappedTaskData,
            invoice.notes || task.notes,
            laborRate
        );
        setHtmlContent(html);
    };

    const calculateTotals = (data) => {
        const issueCost = safeParseNumber(data.issueCost);  // Changed to use issueCost as laborCost
        const partsCost = data.selectedParts.reduce((sum, part) => {
            const quantity = safeParseNumber(part.quantity);
            const cost = safeParseNumber(part.cost);
            return sum + (quantity * cost);
        }, 0);

        const subtotal = issueCost + partsCost;  // Updated to include issueCost

        let discountAmount = 0;
        if (data.discountType === 'percentage') {
            const discountPercent = safeParseNumber(data.discount);
            discountAmount = subtotal * (discountPercent / 100);
        } else {
            discountAmount = safeParseNumber(data.discount);
        }

        const totalCost = Math.max(0, subtotal - discountAmount);

        return {
            issueCost,  // Added issueCost to return
            partsCost,
            subtotal,
            discountAmount,
            totalCost
        };
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'selectedIssue' && value) {
                newData.issueCost = safeParseNumber(value.price, 0);  // Auto-fill issueCost with the selected issue's price
            }
            return newData;
        });
    };

    const handleAddPart = (part, quantity = 1) => {
        if (!part || quantity <= 0) return;

        setFormData(prev => {
            const existing = prev.selectedParts.find(p => p.id === part.id);
            if (existing) {
                return {
                    ...prev,
                    selectedParts: prev.selectedParts.map(p =>
                        p.id === part.id ? {...p, quantity: p.quantity + quantity} : p
                    )
                };
            }
            return {
                ...prev,
                selectedParts: [...prev.selectedParts, {
                    usageId: null,
                    id: part.id,
                    name: part.name,
                    cost: safeParseNumber(part.cost, 0),
                    quantity
                }]
            };
        });
    };

    const handleUpdatePartQuantity = (partId, quantity) => {
        setFormData(prev => ({
            ...prev,
            selectedParts: prev.selectedParts.map(p =>
                p.id === partId ? {...p, quantity: Math.max(0, quantity)} : p
            ).filter(p => p.quantity > 0)
        }));
    };

    const handleRemovePart = (partId) => {
        setFormData(prev => ({
            ...prev,
            selectedParts: prev.selectedParts.filter(p => p.id !== partId)
        }));
    };

    const handleGenerateNew = async () => {
        if (!caseId || invoiceLoading || isGenerating) return;

        if (!formData.selectedIssue) {
            alert('Please select an issue.');
            return;
        }

        const calculations = calculateTotals(formData);

        if (calculations.totalCost < 0) {
            alert('Invalid amounts: Total cannot be negative');
            return;
        }

        setIsGenerating(true);

        const partsToProcess = [...formData.selectedParts];
        let hasStateUpdates = false;

        try {
            // 1. Process Parts (Log New or Update Existing)
            for (let i = 0; i < partsToProcess.length; i++) {
                const p = partsToProcess[i];

                if (p.usageId) {
                    // Update existing part usage
                    await dispatch(updatePartUsage({
                        usageId: p.usageId,
                        usageData: {
                            partId: p.id,
                            taskId: caseId,
                            quantityUsed: p.quantity,
                            notes: p.notes
                        }
                    })).unwrap();
                } else {
                    // Log new part usage
                    const result = await dispatch(logPartUsage({
                        partId: p.id,
                        taskId: caseId,
                        quantityUsed: p.quantity,
                        notes: p.notes
                    })).unwrap();

                    if (result && (result.usageId || result.id)) {
                        partsToProcess[i] = {
                            ...p,
                            usageId: result.usageId || result.id
                        };
                        hasStateUpdates = true;
                    }
                }
            }

            if (hasStateUpdates) {
                setFormData(prev => ({...prev, selectedParts: partsToProcess}));
            }

            // 2. Update Task Labor Hours
            await dispatch(updateTaskStatus({
                taskId: caseId,
                statusData: {
                    laborHours: formData.laborHours
                }
            })).unwrap();

            // 3. Generate Invoice
            const invoiceData = {
                taskId: caseId,
                issueId: formData.selectedIssue.id,
                laborHours: formData.laborHours,
                laborCost: calculations.issueCost,
                partsCost: calculations.partsCost,
                discount: calculations.discountAmount,
                items: partsToProcess.map(p => ({
                    partId: p.id,
                    partName: p.name,
                    quantity: p.quantity,
                    cost: p?.cost
                })),
                notes: formData.notes
            };

            await dispatch(generateInvoice(invoiceData)).unwrap();
            setShowGenerateForm(false);

        } catch (err) {
            console.error('Generate failed:', err);
            if (hasStateUpdates) {
                setFormData(prev => ({...prev, selectedParts: partsToProcess}));
            }
            alert('Failed to save changes or generate invoice. If parts were added, they have been saved. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const printInvoice = () => {
        if (!htmlContent) {
            alert('Nothing to print yet.');
            return;
        }

        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.opacity = '0';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.srcdoc = htmlContent;

            document.body.appendChild(iframe);

            const onLoadHandler = () => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (err) {
                    console.error('Print failed:', err);
                    alert('Print failed – your browser may restrict printing from hidden frames.');
                } finally {
                    setTimeout(() => {
                        try {
                            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                        } catch (e) {
                        }
                    }, 1000);
                }
            };

            iframe.addEventListener('load', onLoadHandler, {once: true});
        } catch (err) {
            console.error('printInvoice error:', err);
            alert('Printing failed – please allow popups or try printing manually.');
        }
    };

    const handleClose = () => {
        setShowGenerateForm(false);
        onClose();
    };

    const isGenerated = !!effectiveInvoice?.invoiceId;
    const calculations = calculateTotals(formData);

    return (
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar sx={{position: 'relative', bgcolor: '#FDDE11', color: 'black'}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose}><CloseIcon/></IconButton>
                    <Typography sx={{ml: 2, flex: 1}} variant="h6">
                        Invoice Preview for Case: {caseId?.substring?.(0, 8)}
                    </Typography>
                    {isGenerated && (
                        <Button color="inherit" startIcon={<PictureAsPdfIcon/>} onClick={printInvoice}
                                disabled={invoiceLoading || isGenerating}>
                            Print
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Box sx={{p: 4, bgcolor: '#f5f5f5', minHeight: '100vh'}}>
                {(invoiceLoading || isGenerating) ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4}}>
                        <LoadingSpinner/>
                        {isGenerating && <Typography>Saving changes and generating invoice...</Typography>}
                    </Box>
                ) : isGenerated ? (
                    <Paper elevation={3} sx={{maxWidth: '210mm', margin: '0 auto'}}>
                        <Box sx={{width: '210mm', minHeight: '297mm', margin: '0 auto', boxShadow: 3}}
                             dangerouslySetInnerHTML={{__html: htmlContent}}/>
                    </Paper>
                ) : showGenerateForm ? (
                    <Paper elevation={3} sx={{maxWidth: '900px', margin: '0 auto', p: 4}}>
                        <Typography variant="h5" gutterBottom>Generate New Invoice</Typography>

                        {/* Issue Selection */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom>Select Issue</Typography>
                            <Autocomplete
                                options={issues || []}
                                getOptionLabel={(option) => option.name || option.description || `Issue ${option.id}`}
                                value={formData.selectedIssue}
                                onChange={(e, value) => handleFormChange('selectedIssue', value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Issue" placeholder="Choose an issue..."/>
                                )}
                                sx={{mb: 2}}
                            />
                        </Box>

                        {/* Labor Section */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom>Labor</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Labor Hours"
                                        type="number"
                                        value={formData.laborHours}
                                        onChange={(e) => handleFormChange('laborHours', parseFloat(e.target.value) || 0)}
                                        inputProps={{step: 0.5, min: 0}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Issue Cost (RWF)"
                                        type="number"
                                        value={formData.issueCost}
                                        onChange={(e) => handleFormChange('issueCost', parseFloat(e.target.value) || 0)}
                                        inputProps={{min: 0}}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{p: 2, bgcolor: '#f0f0f0', borderRadius: 1}}>
                                        <Typography variant="body2" color="textSecondary">Issue Cost</Typography>
                                        <Typography variant="h6">{calculations.issueCost?.toFixed(0)} RWF</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{my: 3}}/>

                        {/* Parts Section */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom>Parts</Typography>
                            <Autocomplete
                                options={availableParts || []}
                                getOptionLabel={(option) => `${option.name} - ${option?.cost} RWF`}
                                onChange={(e, value) => value && handleAddPart(value, 1)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Add Part" placeholder="Search parts..."/>
                                )}
                                sx={{mb: 2}}
                            />

                            {formData.selectedParts.length > 0 && (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Part Name</TableCell>
                                                <TableCell align="right">Unit Price</TableCell>
                                                <TableCell align="right">Quantity</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                                <TableCell align="right">Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.selectedParts.map(part => (
                                                <TableRow key={part.id}>
                                                    <TableCell>{part.name}</TableCell>
                                                    <TableCell align="right">{part?.cost.toFixed(0)} RWF</TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={part.quantity}
                                                            onChange={(e) => handleUpdatePartQuantity(part.id, parseInt(e.target.value) || 0)}
                                                            size="small"
                                                            sx={{width: 80}}
                                                            inputProps={{min: 0}}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        align="right">{(part.quantity * part?.cost).toFixed(0)} RWF</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small"
                                                                    onClick={() => handleRemovePart(part.id)}
                                                                    color="error">
                                                            <DeleteIcon fontSize="small"/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            <Box sx={{p: 2, bgcolor: '#f0f0f0', borderRadius: 1, mt: 2}}>
                                <Typography variant="body2" color="textSecondary">Parts Cost</Typography>
                                <Typography variant="h6">{calculations.partsCost.toFixed(0)} RWF</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{my: 3}}/>

                        {/* Discount Section */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom>Discount</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Discount Value"
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => handleFormChange('discount', parseFloat(e.target.value) || 0)}
                                        inputProps={{min: 0}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl sx={{minWidth: 240}}>
                                        <Autocomplete
                                            value={formData.discountType}
                                            onChange={(e, value) => handleFormChange('discountType', value)}
                                            options={['fixed', 'percentage']}
                                            getOptionLabel={(option) => option === 'fixed' ? 'Fixed Amount (RWF)' : 'Percentage (%)'}
                                            renderInput={(params) => <TextField {...params} label="Discount Type"/>}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{my: 3}}/>

                        {/* Calculations Summary */}
                        <Box sx={{p: 3, bgcolor: '#e3f2fd', borderRadius: 2, mb: 3}}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body1">Issue Cost:</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1"
                                                align="right">{calculations?.issueCost?.toFixed(0)} RWF</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">Parts Cost:</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1"
                                                align="right">{calculations?.partsCost.toFixed(0)} RWF</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" fontWeight="bold">Subtotal:</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" align="right"
                                                fontWeight="bold">{calculations.subtotal.toFixed(0)} RWF</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="error">Discount:</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" align="right" color="error">
                                        -{calculations.discountAmount.toFixed(0)} RWF
                                        {formData.discountType === 'percentage' && ` (${formData.discount}%)`}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}><Divider/></Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h6" color="primary">Total:</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h6" align="right"
                                                color="primary">{calculations.totalCost.toFixed(0)} RWF</Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Notes */}
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            sx={{mb: 3}}
                        />

                        {/* Actions */}
                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end'}}>
                            <Button variant="outlined" onClick={() => setShowGenerateForm(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleGenerateNew}
                                    disabled={invoiceLoading || isGenerating}>
                                Generate Invoice
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Alert
                        severity={invoiceError ? 'error' : 'info'}
                        action={
                            <Button color="inherit" size="small" variant="outlined"
                                    onClick={() => setShowGenerateForm(true)}>
                                Generate Invoice
                            </Button>
                        }
                    >
                        {invoiceError ? `Error: ${invoiceError}` : 'No invoice found for this task. Click "Generate Invoice" to create one.'}
                    </Alert>
                )}
            </Box>
        </Dialog>
    );
};

export default InvoicePreviewDialog;