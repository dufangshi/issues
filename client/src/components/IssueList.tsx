import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Issue, UpdateIssueRequest, CreateIssueRequest } from '../types/Issue';
import issueService from '../services/issueService';
import CreateIssueDialog from './CreateIssueDialog';
import IssueDetail from './IssueDetail';
import AssigneeManager from './AssigneeManager';

interface IssueListProps {
  treeId: string;
  nodeId?: string;
}

const IssueList: React.FC<IssueListProps> = ({ treeId, nodeId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch issues on component mount or when filters change
  useEffect(() => {
    loadIssues();
  }, [treeId, nodeId, filters]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(nodeId && { nodeId }),
      };
      const issuesData = await issueService.getIssuesByTree(treeId, params);
      setIssues(issuesData);
    } catch (error) {
      console.error('Failed to load issues:', error);
      setErrorMessage('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await issueService.deleteIssue(issueId);
        await loadIssues();
        setSuccessMessage('Issue deleted successfully');
      } catch (error) {
        console.error('Failed to delete issue:', error);
        setErrorMessage('Failed to delete issue');
      }
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, status: event.target.value });
  };

  const handlePriorityChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, priority: event.target.value });
  };

  const handleCreateIssue = async (issueData: CreateIssueRequest) => {
    try {
      await issueService.createIssue(treeId, issueData);
      await loadIssues(); // Refresh the list
      setSuccessMessage('Issue created successfully');
    } catch (error) {
      console.error('Failed to create issue:', error);
      setErrorMessage('Failed to create issue');
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleUpdateIssue = async (issueId: string, updates: UpdateIssueRequest) => {
    try {
      await issueService.updateIssue(issueId, updates);
      await loadIssues(); // Refresh the list
      setSuccessMessage('Issue updated successfully');
    } catch (error) {
      console.error('Failed to update issue:', error);
      setErrorMessage('Failed to update issue');
      throw error;
    }
  };

  const handleAddComment = async (issueId: string, comment: { userId: string; content: string }) => {
    try {
      await issueService.addComment(issueId, comment);
      await loadIssues(); // Refresh the list
      setSuccessMessage('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      setErrorMessage('Failed to add comment');
      throw error;
    }
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'issueId', headerName: 'Issue ID', width: 120, minWidth: 120 },
    { field: 'title', headerName: 'Title', width: 200, minWidth: 200, flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value || 'medium'}
          color={getPriorityColor(params.value || 'medium')}
          size="small"
        />
      ),
    },
    {
      field: 'creator',
      headerName: 'Creator',
      width: 120,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.value?.username || params.value?.userId}</span>
      ),
    },
    {
      field: 'assignees',
      headerName: 'Assignees',
      width: 180,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const assignees = params.value || [];
        return (
          <AssigneeManager
            assignees={assignees}
            variant="list"
            maxDisplay={3}
            showTitle={false}
          />
        );
      },
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 150,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value && params.value.length > 0 ? (
            <>
              {params.value.slice(0, 2).map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontSize: '0.75rem',
                    height: 20,
                  }}
                />
              ))}
              {params.value.length > 2 && (
                <Chip
                  label={`+${params.value.length - 2}`}
                  size="small"
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: '#666',
                    fontSize: '0.75rem',
                    height: 20,
                  }}
                />
              )}
            </>
          ) : (
            <span style={{ color: '#999', fontSize: '0.8rem' }}>No tags</span>
          )}
        </Box>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date & Time',
      width: 140,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return <span style={{ color: '#999', fontSize: '0.8rem' }}>No due date</span>;
        }
        
        const dueDate = new Date(params.value);
        const now = new Date();
        
        const isOverdue = dueDate < now;
        const isUpcoming = dueDate > now && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // Next 24 hours
        
        return (
          <span 
            style={{ 
              color: isOverdue ? '#d32f2f' : isUpcoming ? '#ed6c02' : '#666',
              fontSize: '0.75rem',
              fontWeight: isOverdue || isUpcoming ? 'bold' : 'normal'
            }}
          >
            {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 110,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      minWidth: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => setSelectedIssue(params.row)}
              sx={{ p: 0.5 }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEditIssue(params.row)}
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteIssue(params.row.issueId)}
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Issues for Tree: {treeId}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Issue
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            onChange={handlePriorityChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={issues}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        getRowId={(row) => row.issueId}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-main': {
            overflow: 'visible'
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
        }}
        autoHeight={false}
        rowHeight={60}
      />

      {/* Issue Detail Dialog */}
      <IssueDetail
        issue={selectedIssue}
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={handleUpdateIssue}
        onAddComment={handleAddComment}
        onRefreshIssue={async (issueId: string) => {
          const issue = await issueService.getIssueById(issueId);
          return issue;
        }}
      />

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateIssue}
        treeId={treeId}
        nodeId={nodeId}
      />

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssueList;