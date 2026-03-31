import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, Save, Trash2, Search, Pencil,
  Layers, Calendar, Code2, UserCheck, Award, XCircle,
  Clock, X, CheckCircle2, Rocket, RotateCcw, Info, Lock, LogIn
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const COLUMN_METADATA = {
  applied: { title: 'Applied', icon: <Layers size={18} />, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  scheduled: { title: 'Interview Scheduled', icon: <Calendar size={18} />, color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  technical: { title: 'Technical Round', icon: <Code2 size={18} />, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  hr: { title: 'HR Round', icon: <UserCheck size={18} />, color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  selected: { title: 'Selected', icon: <Award size={18} />, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  rejected: { title: 'Rejected', icon: <XCircle size={18} />, color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
};

const KanbanBoard = ({ user, onOpenAuth }) => {
  const [columns, setColumns] = useState({
    applied: { id: 'applied', jobs: [] },
    scheduled: { id: 'scheduled', jobs: [] },
    technical: { id: 'technical', jobs: [] },
    hr: { id: 'hr', jobs: [] },
    selected: { id: 'selected', jobs: [] },
    rejected: { id: 'rejected', jobs: [] }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
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

  // REAL-TIME SYNC WITH FIRESTORE
  useEffect(() => {
    if (!user) {
      setColumns({
        applied: { id: 'applied', jobs: [] },
        scheduled: { id: 'scheduled', jobs: [] },
        technical: { id: 'technical', jobs: [] },
        hr: { id: 'hr', jobs: [] },
        selected: { id: 'selected', jobs: [] },
        rejected: { id: 'rejected', jobs: [] }
      });
      return;
    }

    const docRef = doc(db, "boards", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setColumns(docSnap.data().columns);
      }
    }, (error) => {
      console.error("Error syncing with Firestore: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  const saveToFirestore = async (newColumns) => {
    if (!user) return;
    try {
      const docRef = doc(db, "boards", user.uid);
      await setDoc(docRef, { columns: newColumns });
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      triggerToast('Error saving data', 'red');
    }
  };

  const triggerToast = (text, type = 'success', icon = <CheckCircle2 size={20} />, duration = 4500) => {
    setToastConfig({ text, type, icon });
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleSaveAll = () => {
    if (!user) { onOpenAuth(); return; }
    saveToFirestore(columns);
    triggerToast('🎯 Hey Job Hunter! Your details have been saved successfully!');
  };

  const handleConfirmClear = () => {
    if (!user) return;
    const emptyCols = {
      applied: { id: 'applied', jobs: [] },
      scheduled: { id: 'scheduled', jobs: [] },
      technical: { id: 'technical', jobs: [] },
      hr: { id: 'hr', jobs: [] },
      selected: { id: 'selected', jobs: [] },
      rejected: { id: 'rejected', jobs: [] }
    };
    setColumns(emptyCols);
    saveToFirestore(emptyCols);
    setIsClearConfirmOpen(false);
    triggerToast('All jobs have been cleared!', 'red', <RotateCcw size={20} />);
  };

  const onDragStart = (start) => {
    if (!user) return;
    setDraggingId(start.draggableId);
  };

  const onDragEnd = (result) => {
    setDraggingId(null);
    if (!user) { onOpenAuth(); return; }
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    if (sourceColId === destColId && source.index === destination.index) return;

    const newCols = {
      applied: { ...columns.applied, jobs: [...columns.applied.jobs] },
      scheduled: { ...columns.scheduled, jobs: [...columns.scheduled.jobs] },
      technical: { ...columns.technical, jobs: [...columns.technical.jobs] },
      hr: { ...columns.hr, jobs: [...columns.hr.jobs] },
      selected: { ...columns.selected, jobs: [...columns.selected.jobs] },
      rejected: { ...columns.rejected, jobs: [...columns.rejected.jobs] }
    };
    
    const sourceJobs = newCols[sourceColId].jobs;
    const destJobs = sourceColId === destColId ? sourceJobs : newCols[destColId].jobs;
    
    if (sourceColId === 'applied' && destColId !== 'applied') {
      const jobToClone = sourceJobs[source.index];
      const clone = { ...jobToClone, id: `job-clone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, stage: destColId };
      destJobs.splice(destination.index, 0, clone);
    } else {
      const [removed] = sourceJobs.splice(source.index, 1);
      const updatedJob = { ...removed, stage: destColId };
      destJobs.splice(destination.index, 0, updatedJob);
    }

    setColumns(newCols);
    saveToFirestore(newCols);

    if (destColId !== sourceColId) {
      if (destColId === 'selected') {
        triggerToast('🎉 Hey Job Hunter, Congrats on getting the job!', 'success', <></>, 4500);
      } else if (destColId === 'rejected') {
        triggerToast('💪 Please do not feel bad, keep trying, something great is coming your way!', 'success', <></>, 4500);
      }
    }
  };

  const handleOpenNewJob = () => {
    if (!user) { onOpenAuth(); return; }
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
    if (!user) return;
    setEditingJob({ columnId, id: job.id });
    setNewJob({ ...job });
    setIsDrawerOpen(true);
  };

  const handleAddOrUpdateJob = () => {
    if (!user) return;
    if (!newJob.company || !newJob.role) return;

    const newCols = {
      applied: { ...columns.applied, jobs: [...columns.applied.jobs] },
      scheduled: { ...columns.scheduled, jobs: [...columns.scheduled.jobs] },
      technical: { ...columns.technical, jobs: [...columns.technical.jobs] },
      hr: { ...columns.hr, jobs: [...columns.hr.jobs] },
      selected: { ...columns.selected, jobs: [...columns.selected.jobs] },
      rejected: { ...columns.rejected, jobs: [...columns.rejected.jobs] }
    };

    if (editingJob) {
      const oldColId = editingJob.columnId;
      const targetStage = newJob.stage;
      
      const updatedJob = { 
        ...newJob, 
        id: editingJob.id,
        createdAt: newJob.appliedDate || newJob.createdAt 
      };

      if (oldColId === targetStage) {
        newCols[oldColId].jobs = newCols[oldColId].jobs.map(j => 
          j.id === editingJob.id ? updatedJob : j
        );
      } else {
        newCols[oldColId].jobs = newCols[oldColId].jobs.filter(j => j.id !== editingJob.id);
        newCols[targetStage].jobs = [updatedJob, ...newCols[targetStage].jobs];
      }
      triggerToast('Job Details Updated!');
    } else {
      const job = {
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...newJob,
        createdAt: newJob.appliedDate
      };
      const targetStage = newJob.stage;
      newCols[targetStage].jobs = [job, ...newCols[targetStage].jobs];
      triggerToast('New Job Added!');
    }

    setColumns(newCols);
    saveToFirestore(newCols);
    setIsDrawerOpen(false);
  };

  const deleteJob = (columnId, jobId) => {
    if (!user) return;
    const newCols = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        jobs: columns[columnId].jobs.filter(j => j.id !== jobId)
      }
    };
    setColumns(newCols);
    saveToFirestore(newCols);
    triggerToast('Job Deleted', 'red');
  };

  const CardContent = ({ job, color, isGhost = false, onDelete, onEdit }) => (
    <div 
      className={`job-card ${isGhost ? 'ghost-placeholder-card' : ''}`}
      style={{
        opacity: isGhost ? 0.4 : 1,
        borderLeft: `6px solid ${color.split('#')[1] ? '#' + color.split('#')[1].substring(0,6) : '#3b82f6'}`,
        pointerEvents: isGhost ? 'none' : 'auto',
      }}
    >
      <div className="job-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4>{job.company}</h4>
          <p>{job.role}</p>
        </div>
        {!isGhost && (
          <div className="job-card-actions">
            <button onClick={onEdit} className="card-action-btn edit"><Pencil size={14} /></button>
            <button onClick={onDelete} className="card-action-btn delete"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="job-card-footer">
        <div className="job-card-date">
          <Clock size={12} />
          <span>{job.createdAt}</span>
        </div>
        <span className="status-dot" style={{ background: color.split('#').length > 1 ? '#' + color.split('#')[1].substring(0,6) : '#3b82f6' }}></span>
      </div>
    </div>
  );

  const getDateLabel = (stage) => {
    switch(stage) {
      case 'applied': return 'Applied Date';
      case 'scheduled': return 'Interview Date';
      case 'technical': return 'Technical Round Date';
      case 'hr': return 'HR Round Date';
      case 'selected': return 'Selected Date';
      case 'rejected': return 'Rejected Date';
      default: return 'Applied Date';
    }
  };

  return (
    <div className="kanban-board-container" style={{ position: 'relative' }}>
        
      {!user && (
        <div className="glass-card" style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          zIndex: 100, 
          padding: '3rem', 
          textAlign: 'center',
          backdropFilter: 'blur(15px)',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '32px',
          width: '400px'
        }}>
           <Lock size={48} style={{ color: '#3b82f6', marginBottom: '1.5rem', opacity: 0.8 }} />
           <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Login to Access Tracker</h3>
           <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.9rem' }}>Tracking your career journey requires a profile to save your applications securely.</p>
           <button 
             className="rocket-button" 
             onClick={onOpenAuth}
             style={{ width: '100%' }}
           >
             <LogIn size={20} /> Login Now
           </button>
        </div>
      )}

      <div className={`toast-notification ${showToast ? 'visible' : ''} ${toastConfig.type === 'red' ? 'red' : ''}`}>
        {toastConfig.icon}
        {toastConfig.text}
      </div>

      <div className="advice-banner">
        <Info size={18} />
        <span>Experience the full power of the Job Tracker on your Laptop, iPad, or Tablet for the best layout and drag-and-drop experience.</span>
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
        backdropFilter: 'blur(10px)',
        opacity: user ? 1 : 0.3,
        pointerEvents: user ? 'auto' : 'none'
      }}>
        <h2 className="section-title" style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem' }}>Job Tracker Board</h2>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <button className="primary-button primary-button-green" onClick={handleSaveAll}><Save size={18} /> Save Details</button>
          <button className="primary-button primary-button-red" onClick={() => setIsClearConfirmOpen(true)}><Trash2 size={18} /> Clear All</button>
          <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', height: '2.5rem', margin: '0 0.5rem' }}></div>
          <button className="primary-button primary-button-blue" onClick={handleOpenNewJob}><Plus size={18} /> New Job</button>
        </div>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="kanban-board" style={{ opacity: user ? 1 : 0.2, filter: user ? 'none' : 'blur(5px)' }}>
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

                <Droppable droppableId={key} isDropDisabled={!user}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="job-cards-container"
                      style={{ 
                        background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.1)' : 'transparent'
                      }}
                    >
                      {column.jobs.map((job, index) => (
                        <div key={job.id} style={{ position: 'relative' }}>
                          <Draggable draggableId={job.id} index={index} isDragDisabled={!user}>
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
              <input type="text" placeholder="Where are you applying?" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} />
            </div>

            <div className="input-group">
              <label>Job Role</label>
              <input type="text" placeholder="e.g. Senior QA Engineer" value={newJob.role} onChange={(e) => setNewJob({...newJob, role: e.target.value})} />
            </div>

            <div className="input-group">
              <label>{getDateLabel(newJob.stage)}</label>
              <input type="date" value={newJob.appliedDate} onChange={(e) => setNewJob({...newJob, appliedDate: e.target.value})} />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Current Stage {!editingJob && <Lock size={12} style={{ opacity: 0.6 }} />}
              </label>
              <select 
                value={newJob.stage} 
                onChange={(e) => setNewJob({...newJob, stage: e.target.value, appliedDate: new Date().toISOString().split('T')[0]})}
                disabled={!editingJob}
                style={{
                  opacity: !editingJob ? 0.6 : 1,
                  cursor: !editingJob ? 'not-allowed' : 'pointer',
                  backgroundColor: !editingJob ? 'rgba(255, 255, 255, 0.02)' : undefined
                }}
              >
                {Object.keys(COLUMN_METADATA).map(k => ( <option key={k} value={k} style={{ background: '#0f172a', color: '#f1f5f9' }}>{COLUMN_METADATA[k].title}</option> ))}
              </select>
            </div>

            <div className="input-group">
              <label>Notes & Reminders</label>
              <textarea placeholder="What should you remember for the interview?" value={newJob.notes} onChange={(e) => setNewJob({...newJob, notes: e.target.value})} rows="5" />
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

      <div className={`confirmation-overlay ${isClearConfirmOpen ? 'open' : ''}`} onClick={() => setIsClearConfirmOpen(false)}>
        <div className="confirmation-popup" onClick={(e) => e.stopPropagation()}>
          <span className="warning-icon">⚠️</span>
          <h2>Are you sure?</h2>
          <p>This will permanently delete all your tracked jobs. This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="primary-button" onClick={() => setIsClearConfirmOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none' }}>No, Keep Them</button>
            <button className="primary-button primary-button-red" onClick={handleConfirmClear} style={{ flex: 1 }}>Yes, Clear All</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
