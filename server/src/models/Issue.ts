import mongoose, { Schema, Document } from 'mongoose';
import { Issue as IssueInterface } from '../types/Issue';

// Extend the interface to include mongoose Document properties
export interface IssueDocument extends Omit<IssueInterface, '_id'>, Document {}

// Define the schema
const IssueSchema = new Schema<IssueDocument>({
  issueId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  treeId: { 
    type: String, 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  creator: {
    userId: { type: String, required: true },
    username: { type: String }
  },
  assignees: [{
    userId: { type: String, required: true },
    username: { type: String },
    assignedAt: { type: Date, default: Date.now }
  }],
  nodes: [{
    nodeId: { type: String, required: true }
  }],
  tags: [{ type: String }],
  comments: [{
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date },
  resolvedBy: { type: String }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
IssueSchema.index({ treeId: 1, status: 1 });
IssueSchema.index({ treeId: 1, 'nodes.nodeId': 1 });
IssueSchema.index({ createdAt: -1 });

// Export the model
export default mongoose.model<IssueDocument>('Issue', IssueSchema); 