import {createSlice} from '@reduxjs/toolkit';
import {
    fetchServiceCases,
    fetchCaseDetails,
    reassignTask,
    fetchAlerts,
    fetchStatistics,
    fetchTimeline,
    fetchPeakHours
} from './monitoringThunks';

const initialState = {
    casesPage: null,
    currentCase: null,
    alerts: [],
    stats: null,
    timeline: [],
    peakHours: [],
    loading: false,
    error: null,
    successMessage: null
};

const monitoringSlice = createSlice({
    name: 'monitoring',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearCurrentCase: (state) => {
            state.currentCase = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServiceCases.pending, (s) => {
                s.loading = true;
            })
            .addCase(fetchServiceCases.fulfilled, (s, a) => {
                s.loading = false;
                s.casesPage = a.payload;
            })
            .addCase(fetchServiceCases.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })

            .addCase(fetchCaseDetails.fulfilled, (s, a) => {
                s.currentCase = a.payload;
            })

            .addCase(reassignTask.fulfilled, (s, a) => {
                s.successMessage = 'Technician reassigned';
                const updated = a.payload;
                if (s.casesPage) {
                    s.casesPage.content = s.casesPage.content.map(c =>
                        c.caseId === updated.caseId ? updated : c
                    );
                }
                if (s.currentCase?.caseInfo.caseId === updated.caseId) {
                    s.currentCase.caseInfo = updated;
                }
            })

            .addCase(fetchAlerts.fulfilled, (s, a) => {
                s.alerts = a.payload;
            })
            .addCase(fetchStatistics.fulfilled, (s, a) => {
                s.stats = a.payload;
            })
            .addCase(fetchTimeline.fulfilled, (s, a) => {
                s.timeline = a.payload;
            })
            .addCase(fetchPeakHours.fulfilled, (s, a) => {
                s.peakHours = a.payload;
            })

            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const {clearError, clearSuccessMessage, clearCurrentCase} = monitoringSlice.actions;
export default monitoringSlice.reducer;