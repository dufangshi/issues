import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  Box,
  IconButton,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Label as LabelIcon,
  Flag as PriorityIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { Issue, UpdateIssueRequest } from '../types/Issue';
import UserSelector, { type User } from './UserSelector';
import AssigneeManager from './AssigneeManager';

interface IssueDetailProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (issueId: string, updates: UpdateIssueRequest) => Promise<void>;
  onAddComment?: (issueId: string, comment: { userId: string; content: string }) => Promise<void>;
  onRefreshIssue?: (issueId: string) => Promise<Issue>;
}

const IssueDetail: React.FC<IssueDetailProps> = ({
  issue,
  open,
  onClose,
  onUpdate,
  onAddComment,
  onRefreshIssue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateIssueRequest>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);


  React.useEffect(() => {
    setCurrentIssue(issue);
  }, [issue]);

  React.useEffect(() => {
    if (currentIssue) {
      const assigneeUsers = currentIssue.assignees || [];
      setEditData({
        title: currentIssue.title,
        description: currentIssue.description,
        status: currentIssue.status,
        priority: currentIssue.priority,
        tags: currentIssue.tags || [],
        assignees: assigneeUsers.map(a => ({
          userId: a.userId,
          username: a.username
        })),
      });
    }
  }, [currentIssue]);

  if (!currentIssue) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const assigneeUsers = currentIssue.assignees || [];
    setEditData({
      title: currentIssue.title,
      description: currentIssue.description,
      status: currentIssue.status,
      priority: currentIssue.priority,
      tags: currentIssue.tags || [],
      assignees: assigneeUsers.map(a => ({
        userId: a.userId,
        username: a.username
      })),
    });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onUpdate(currentIssue.issueId, editData);
      setIsEditing(false);
      if (onRefreshIssue) {
        const refreshedIssue = await onRefreshIssue(currentIssue.issueId);
        setCurrentIssue(refreshedIssue);
      }
    } catch (error) {
      console.error('Failed to update issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setEditData({ ...editData, status: event.target.value as Issue['status'] });
  };

  const handlePriorityChange = (event: SelectChangeEvent<string>) => {
    setEditData({ ...editData, priority: event.target.value as Issue['priority'] });
  };

  const handleAssigneesChange = async (users: User[]) => {
    console.log('handleAssigneesChange', users);
    const assigneeUpdates = users.map(u => ({
      userId: u.userId,
      username: u.username
    }));
    
    setEditData({ 
      ...editData, 
      assignees: assigneeUpdates
    });
    
    // Directly save assignees changes to backend
    setLoading(true);
    try {
      await onUpdate(currentIssue.issueId, { assignees: assigneeUpdates });
      if (onRefreshIssue) {
        const refreshedIssue = await onRefreshIssue(currentIssue.issueId);
        setCurrentIssue(refreshedIssue);
      }
    } catch (error) {
      console.error('Failed to update assignees:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;
    
    setLoading(true);
    try {
      await onAddComment(currentIssue.issueId, {
        userId: 'demo-user',
        content: newComment.trim(),
      });
      setNewComment('');
      if (onRefreshIssue) {
        const refreshedIssue = await onRefreshIssue(currentIssue.issueId);
        setCurrentIssue(refreshedIssue);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#1976d2';
      case 'in_progress': return '#ed6c02';
      case 'resolved': return '#2e7d32';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#2e7d32';
      case 'medium': return '#ed6c02';
      case 'high': return '#d32f2f';
      case 'urgent': return '#d32f2f';
      default: return '#ed6c02';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="auto"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          height: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#f6f8fa',
          borderBottom: '1px solid #d1d9e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#24292f' }}>
            {isEditing ? 'Edit Issue' : 'Issue Details'}
          </Typography>
          <Chip
            label={currentIssue.issueId}
            size="small"
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontFamily: 'monospace',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isEditing ? (
            <IconButton onClick={handleStartEdit} size="small">
              <EditIcon />
            </IconButton>
          ) : (
            <>
              <IconButton onClick={handleSaveEdit} size="small" disabled={loading}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancelEdit} size="small">
                <CancelIcon />
              </IconButton>
            </>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Main Content */}
          <Grid item xs={12} md={9} sx={{ p: 3, overflow: 'auto' }}>
            {/* Title */}
            <Box sx={{ mb: 3 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Title"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  variant="outlined"
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#24292f', mb: 1 }}>
                  {currentIssue.title}
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon fontSize="small" />
                Description
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Description"
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  variant="outlined"
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                    minHeight: 100,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {currentIssue.description || 'No description provided.'}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Comments Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon fontSize="small" />
                Comments ({currentIssue.comments?.length || 0})
              </Typography>
              
              {currentIssue.comments && currentIssue.comments.length > 0 ? (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {currentIssue.comments.map((comment) => (
                    <Paper
                      key={comment.commentId}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {comment.userId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No comments yet.
                </Typography>
              )}

              {/* Add Comment */}
              {onAddComment && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    size="small"
                  >
                    Add Comment
                  </Button>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              bgcolor: '#f8f9fa',
              borderLeft: '1px solid #e1e4e8',
              p: 3,
              overflow: 'auto',
            }}
          >
            {/* Status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Status
              </Typography>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <Select
                    value={editData.status || currentIssue.status}
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="open">🔵 Open</MenuItem>
                    <MenuItem value="in_progress">🟡 In Progress</MenuItem>
                    <MenuItem value="resolved">🟢 Resolved</MenuItem>
                    <MenuItem value="closed">⚫ Closed</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  label={currentIssue.status.replace('_', ' ')}
                  sx={{
                    bgcolor: getStatusColor(currentIssue.status) + '20',
                    color: getStatusColor(currentIssue.status),
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>

            {/* Priority */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityIcon fontSize="small" />
                Priority
              </Typography>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <Select
                    value={editData.priority || currentIssue.priority || 'medium'}
                    onChange={handlePriorityChange}
                  >
                    <MenuItem value="low">🟢 Low</MenuItem>
                    <MenuItem value="medium">🟡 Medium</MenuItem>
                    <MenuItem value="high">🟠 High</MenuItem>
                    <MenuItem value="urgent">🔴 Urgent</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  label={currentIssue.priority || 'medium'}
                  sx={{
                    bgcolor: getPriorityColor(currentIssue.priority || 'medium') + '20',
                    color: getPriorityColor(currentIssue.priority || 'medium'),
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>

            {/* Tags */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LabelIcon fontSize="small" />
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {currentIssue.tags && currentIssue.tags.length > 0 ? (
                  currentIssue.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        mb: 0.5,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tags
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Assignees */}
            <AssigneeManager
              assignees={(currentIssue.assignees || []).map(a => ({
                userId: a.userId,
                username: a.username || a.userId,
                email: undefined,
                avatar: null
              }))}
              onAssigneesChange={handleAssigneesChange}
              editable={true}
              variant="detail"
              title="Assignees"
              disabled={loading}
            />

            <Divider sx={{ my: 2 }} />

            {/* Creator */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                Creator
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">
                  {currentIssue.creator.username || currentIssue.creator.userId}
                </Typography>
              </Box>
            </Box>



            {/* Created Date */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" />
                Created
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(currentIssue.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {/* Updated Date */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Last Updated
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(currentIssue.updatedAt).toLocaleString()}
              </Typography>
            </Box>

            {/* Tree and Node Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Tree Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tree ID:</strong> {currentIssue.treeId}
              </Typography>
              {currentIssue.nodes && currentIssue.nodes.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Nodes:</strong> {currentIssue.nodes.map(n => n.nodeId).join(', ')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetail; 