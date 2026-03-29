import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, Save, Trash2, Search, Pencil,
  Layers, Calendar, Code2, UserCheck, Award, XCircle,
  Clock, X, CheckCircle2, Rocket, RotateCcw
} from 'lucide-react';

const COLUMN_METADATA = {
  applied: { title: 'Applied', icon: <Layers size={18} />, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  scheduled: { title: 'Interview Scheduled', icon: <Calendar size={18} />, color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  technical: { title: 'Technical Round', icon: <Code2 size={18} />, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  hr: { title: 'HR Round', icon: <UserCheck size={18} />, color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  selected: { title: 'Selected', icon: <Award size={18} />, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  rejected: { title: 'Rejected', icon: <XCircle size={18} />, color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('qa-career-hub-jobs-v2');
    if (saved) return JSON.parse(saved);
    return {
      applied: { id: 'applied', jobs: [] },
      scheduled: { id: 'scheduled', jobs: [] },
      technical: { id: 'technical', jobs: [] },
      hr: { id: 'hr', jobs: [] },
      selected: { id: 'selected', jobs: [] },
      rejected: { id: 'rejected', jobs: [] }
    };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // { columnId, job }
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ text: '', type: 'success', icon: <CheckCircle2 size={20} /> });
  const [draggingId, setDraggingId] = useState(null);
  const [newJob, setNewJob] = useState({ 
    company: '', 
    role: '', 
    appliedDate: new Date().toISOString().split('T')[0],
    stage: 'applied',
    notes: '' 
  });

  const triggerToast = (text, type = 'success', icon = <CheckCircle2 size={20} />) => {
    setToastConfig({ text, type, icon });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveAll = () => {
    localStorage.setItem('qa-career-hub-jobs-v2', JSON.stringify(columns));
    triggerToast('🎯 Hey Job Hunter! Your details have been saved successfully!');
  };

  const handleConfirmClear = () => {
    const emptyCols = {
      applied: { id: 'applied', jobs: [] },
      scheduled: { id: 'scheduled', jobs: [] },
      technical: { id: 'technical', jobs: [] },
      hr: { id: 'hr', jobs: [] },
      selected: { id: 'selected', jobs: [] },
      rejected: { id: 'rejected', jobs: [] }
    };
    setColumns(emptyCols);
    localStorage.setItem('qa-career-hub-jobs-v2', JSON.stringify(emptyCols));
    setIsClearConfirmOpen(false);
    triggerToast('All jobs have been cleared!', 'red', <RotateCcw size={20} />);
  };

  const onDragStart = (start) => {
    setDraggingId(start.draggableId);
  };

  const onDragEnd = (result) => {
    setDraggingId(null);
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    if (sourceColId === destColId && source.index === destination.index) return;

    const newCols = { ...columns };
    const sourceJobs = [...newCols[sourceColId].jobs];
    const destJobs = sourceColId === destColId ? sourceJobs : [...newCols[destColId].jobs];
    
    if (sourceColId === 'applied' && destColId !== 'applied') {
      // Cloning logic from Applied
      const jobToClone = sourceJobs[source.index];
      const clone = { ...jobToClone, id: `job-clone-${Date.now()}`, stage: destColId };
      destJobs.splice(destination.index, 0, clone);
      // Source jobs remain untouched
    } else {
      // Standard move logic
      const [removed] = sourceJobs.splice(source.index, 1);
      const updatedJob = { ...removed, stage: destColId };
      destJobs.splice(destination.index, 0, updatedJob);
    }

    newCols[sourceColId] = { ...newCols[sourceColId], jobs: sourceJobs };
    if (sourceColId !== destColId) {
      newCols[destColId] = { ...newCols[destColId], jobs: destJobs };
    }

    setColumns(newCols);
    localStorage.setItem('qa-career-hub-jobs-v2', JSON.stringify(newCols));
  };

  const handleOpenNewJob = () => {
    setEditingJob(null);
    setNewJob({ 
      company: '', 
      role: '', 
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'applied',
      notes: '' 
    });
    setIsDrawerOpen(true);
  };

  const handleEditJob = (columnId, job) => {
    setEditingJob({ columnId, id: job.id });
    setNewJob({ ...job });
    setIsDrawerOpen(true);
  };

  const handleAddOrUpdateJob = () => {
    if (!newJob.company || !newJob.role) return;

    const newCols = { ...columns };

    if (editingJob) {
      // Remove from old column if stage changed, or just update in current
      const oldColId = editingJob.columnId;
      const targetStage = newJob.stage;

      newCols[oldColId].jobs = newCols[oldColId].jobs.filter(j => j.id !== editingJob.id);
      
      const updatedJob = { ...newJob, id: editingJob.id };
      newCols[targetStage].jobs = [updatedJob, ...newCols[targetStage].jobs];
      
      triggerToast('Job Details Updated!');
    } else {
      const job = {
        id: `job-${Date.now()}`,
        ...newJob,
        createdAt: newJob.appliedDate
      };
      const targetStage = newJob.stage;
      newCols[targetStage].jobs = [job, ...newCols[targetStage].jobs];
      triggerToast('New Job Added!');
    }

    setColumns(newCols);
    localStorage.setItem('qa-career-hub-jobs-v2', JSON.stringify(newCols));
    setIsDrawerOpen(false);
  };

  const deleteJob = (columnId, jobId) => {
    const newCols = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        jobs: columns[columnId].jobs.filter(j => j.id !== jobId)
      }
    };
    setColumns(newCols);
    localStorage.setItem('qa-career-hub-jobs-v2', JSON.stringify(newCols));
    triggerToast('Job Deleted', 'red');
  };

  const CardContent = ({ job, color, isGhost = false, onDelete, onEdit }) => (
    <div 
      className={`job-card ${isGhost ? 'ghost-placeholder-card' : ''}`}
      style={{
        opacity: isGhost ? 0.4 : 1,
        borderLeft: `4px solid ${color.split('#')[1] ? '#' + color.split('#')[1].substring(0,6) : '#3b82f6'}`,
        pointerEvents: isGhost ? 'none' : 'auto',
        background: isGhost ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
      }}
    >
      <div className="job-card-header">
        <div style={{ flex: 1 }}>
          <h4 style={{ color: isGhost ? 'rgba(0,0,0,0.2)' : '#0f172a', fontSize: '1rem' }}>{job.company}</h4>
          <p style={{ color: isGhost ? 'rgba(0,0,0,0.2)' : '#475569', fontSize: '0.85rem' }}>{job.role}</p>
        </div>
        {!isGhost && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={onEdit}
              style={{ color: '#3b82f6', background: 'transparent', padding: '4px', cursor: 'pointer', border: 'none' }}
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={onDelete}
              style={{ color: '#ef4444', background: 'transparent', padding: '4px', cursor: 'pointer', border: 'none' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: isGhost ? 'transparent' : '#64748b', fontWeight: '500' }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          {job.createdAt}
        </div>
        <span className="status-dot" style={{ background: color.includes('ef4444') ? '#ef4444' : (color.includes('10b981') ? '#10b981' : '#3b82f6'), opacity: isGhost ? 0.3 : 1 }}></span>
      </div>
    </div>
  );

  return (
    <div className="kanban-board-container">
      <div className={`toast-notification ${showToast ? 'visible' : ''} ${toastConfig.type === 'red' ? 'red' : ''}`}>
        {toastConfig.icon}
        {toastConfig.text}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.03)',
        padding: '1rem 1.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 className="section-title" style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem' }}>Job Tracker Board</h2>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <button className="primary-button primary-button-green" onClick={handleSaveAll}>
            <Save size={18} /> Save Details
          </button>
          <button className="primary-button primary-button-red" onClick={() => setIsClearConfirmOpen(true)}>
            <Trash2 size={18} /> Clear All
          </button>
          <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', height: '2.5rem', margin: '0 0.5rem' }}></div>
          <button className="primary-button primary-button-blue" onClick={handleOpenNewJob}>
            <Plus size={18} /> New Job
          </button>
        </div>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.keys(COLUMN_METADATA).map((key) => {
            const column = columns[key] || { id: key, jobs: [] };
            const meta = COLUMN_METADATA[key];

            return (
              <div key={key} className="kanban-column">
                <header className="column-header" style={{ background: meta.color }}>
                  <div className="column-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {meta.icon}
                      <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>{meta.title} ( {column.jobs.length} )</span>
                    </div>
                  </div>
                </header>

                <Droppable droppableId={key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="job-cards-container"
                      style={{ 
                        background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.1)' : 'transparent',
                        minHeight: '200px',
                        position: 'relative'
                      }}
                    >
                      {column.jobs.map((job, index) => (
                        <div key={job.id} style={{ position: 'relative' }}>
                          <Draggable draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`job-card-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <CardContent 
                                  job={job} 
                                  color={meta.color} 
                                  isGhost={false} 
                                  onDelete={() => deleteJob(key, job.id)} 
                                  onEdit={() => handleEditJob(key, job)}
                                />
                              </div>
                            )}
                          </Draggable>
                          {draggingId === job.id && (
                            <CardContent job={job} color={meta.color} isGhost={true} />
                          )}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <div className={`side-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div>
              <h2>{editingJob ? "✏️ Edit Journey" : "🚀 Add New Journey"}</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '4px' }}>
                {editingJob ? "Adjust your opportunity details" : "Track your next big opportunity"}
              </p>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div className="drawer-content">
            <div className="input-group">
              <label>Company Name</label>
              <input 
                type="text" 
                placeholder="Where are you applying?"
                value={newJob.company}
                onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Job Role</label>
              <input 
                type="text" 
                placeholder="e.g. Senior QA Engineer"
                value={newJob.role}
                onChange={(e) => setNewJob({...newJob, role: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Applied Date</label>
              <input 
                type="date" 
                value={newJob.appliedDate}
                onChange={(e) => setNewJob({...newJob, appliedDate: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Current Stage</label>
              <select 
                value={newJob.stage}
                onChange={(e) => setNewJob({...newJob, stage: e.target.value})}
              >
                {Object.keys(COLUMN_METADATA).map(k => (
                  <option key={k} value={k}>{COLUMN_METADATA[k].title}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Notes & Reminders</label>
              <textarea 
                placeholder="What should you remember for the interview?"
                value={newJob.notes}
                onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                rows="5"
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button className="rocket-button" onClick={handleAddOrUpdateJob}>
              {editingJob ? <CheckCircle2 size={20} /> : <Rocket size={20} />}
              {editingJob ? "Update Job" : "Add to Board"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      <div className={`confirmation-overlay ${isClearConfirmOpen ? 'open' : ''}`} onClick={() => setIsClearConfirmOpen(false)}>
        <div className="confirmation-popup" onClick={(e) => e.stopPropagation()}>
          <span className="warning-icon">⚠️</span>
          <h2>Are you sure?</h2>
          <p>This will permanently delete all your tracked jobs. This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="primary-button" 
              onClick={() => setIsClearConfirmOpen(false)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none' }}
            >
              No, Keep Them
            </button>
            <button 
              className="primary-button primary-button-red" 
              onClick={handleConfirmClear}
              style={{ flex: 1 }}
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
