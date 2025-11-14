import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';

const IconButton=({title,onClick,children})=> (
  <button onClick={onClick} title={title} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:8,background:'#111827',color:'#fff',border:'1px solid #111827'}}>
    {children}
  </button>
);

const iconProps={width:16,height:16,fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'};
const PencilIcon=()=> (
  <svg {...iconProps} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);
const ArchiveIcon=()=> (
  <svg {...iconProps} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="4" rx="1"/>
    <path d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"/>
    <path d="M10 12h4"/>
  </svg>
);

// Outlined icon-only button used inside tables
const OutlineIconButton=({title,onClick,children})=> (
  <button
    onClick={onClick}
    title={title}
    style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',
      width:32,height:32,borderRadius:8,
      background:'#fff',color:'#111827',
      border:'1px solid #D1D5DB'
    }}
  >
    {children}
  </button>
);

export default function Settings(){
  const [tab,setTab]=useState('years');
  const [years,setYears]=useState([]);
  const [depts,setDepts]=useState([]);
  const [courses,setCourses]=useState([]);
  const [yearsArchived,setYearsArchived]=useState([]);
  const [deptsArchived,setDeptsArchived]=useState([]);
  const [coursesArchived,setCoursesArchived]=useState([]);
  const [studentsArchived,setStudentsArchived]=useState([]);
  const [facultyArchived,setFacultyArchived]=useState([]);
  const [loading,setLoading]=useState(false);
  // Modal states
  const blankYear={label:'',start_date:'',end_date:'',status:'Active'};
  const [yearModal,setYearModal]=useState(false);
  const [yearForm,setYearForm]=useState(blankYear);
  const [yearEditing,setYearEditing]=useState(null);

  const blankDept={name:'',status:'Active'};
  const [deptModal,setDeptModal]=useState(false);
  const [deptForm,setDeptForm]=useState(blankDept);
  const [deptEditing,setDeptEditing]=useState(null);

  const blankCourse={name:'',department_id:'',status:'Active'};
  const [courseModal,setCourseModal]=useState(false);
  const [courseForm,setCourseForm]=useState(blankCourse);
  const [courseEditing,setCourseEditing]=useState(null);

  const toArray=(resp)=>{
    const data = resp && resp.data;
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const refresh=async()=>{
    setLoading(true);
    try{
      const [y,d,c,ya,da,ca,sa,fa]=await Promise.all([
        axios.get('/academic-years'),
        axios.get('/departments'),
        axios.get('/courses'),
        axios.get('/archived/academic-years'),
        axios.get('/archived/departments'),
        axios.get('/archived/courses'),
        axios.get('/archived/students'),
        axios.get('/archived/faculty'),
      ]);
      setYears(toArray(y)); setDepts(toArray(d)); setCourses(toArray(c));
      setYearsArchived(toArray(ya)); setDeptsArchived(toArray(da)); setCoursesArchived(toArray(ca));
      setStudentsArchived(toArray(sa)); setFacultyArchived(toArray(fa));
    } finally { setLoading(false); }
  };

  useEffect(()=>{refresh()},[]);

  const fmtDate=(v)=>{
    if(!v) return '—';
    try{ return new Date(v).toLocaleDateString(undefined,{year:'numeric',month:'numeric',day:'numeric'}); }
    catch{ return String(v); }
  };

  // Helpers to derive years from label and merge month/day into a specific year
  const yearsFromLabel=(label)=>{
    const m=String(label||'').match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if(!m) return null;
    const start=parseInt(m[1],10), end=parseInt(m[2],10);
    if(Number.isNaN(start)||Number.isNaN(end)) return null;
    return {start, end};
  };
  const mergeWithYear=(inputDate, targetYear)=>{
    if(!inputDate || !targetYear) return inputDate;
    const d=new Date(inputDate);
    if(isNaN(d)) return inputDate;
    const mm=String(d.getMonth()+1).padStart(2,'0');
    const dd=String(d.getDate()).padStart(2,'0');
    return `${targetYear}-${mm}-${dd}`;
  };

  const StatusPill=({value})=>{
    const active=value==='Active';
    const style={
      background: active? '#DCFCE7' : '#F3F4F6',
      color: active? '#065F46' : '#374151',
      border: `1px solid ${active? '#A7F3D0':'#E5E7EB'}`,
      borderRadius: 9999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      display:'inline-block'
    };
    return <span style={style}>{value}</span>;
  };

  const Section=({title,subtitle,children,action})=> (
    <div style={{marginTop:16,background:'#fff',border:'1px solid #E5E7EB',padding:16,borderRadius:12,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div>
          <div style={{fontWeight:700,fontSize:16}}>{title}</div>
          {subtitle && <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  // Years: open/save
  const openAddYear=()=>{ setYearEditing(null); setYearForm(blankYear); setYearModal(true); };
  const openEditYear=(ay)=>{ setYearEditing(ay); setYearForm({label:ay.label,start_date:ay.start_date,end_date:ay.end_date,status:ay.status}); setYearModal(true); };
  const saveYear=async()=>{
    const payload={...yearForm};
    if(!payload.label||!payload.start_date||!payload.end_date){ alert('Please fill label, start and end date.'); return; }
    if(yearEditing){ await axios.put(`/academic-years/${yearEditing.id}`, payload); }
    else { await axios.post('/academic-years', payload); }
    setYearModal(false); setYearEditing(null); setYearForm(blankYear); await refresh();
  };
  const delYear=async(ay)=>{ if(confirm('Archive academic year?')){ await axios.delete(`/academic-years/${ay.id}`); await refresh(); setTab('archived'); }};
  const restoreYear=async(ay)=>{ await axios.post(`/academic-years/${ay.id}/restore`); await refresh(); };

  // Departments: open/save
  const openAddDept=()=>{ setDeptEditing(null); setDeptForm(blankDept); setDeptModal(true); };
  const openEditDept=(d)=>{ setDeptEditing(d); setDeptForm({name:d.name,status:d.status}); setDeptModal(true); };
  const saveDept=async()=>{
    const payload={...deptForm}; if(!payload.name){ alert('Name is required.'); return; }
    if(deptEditing){ await axios.put(`/departments/${deptEditing.id}`, payload); }
    else { await axios.post('/departments', payload); }
    setDeptModal(false); setDeptEditing(null); setDeptForm(blankDept); await refresh();
  };
  const delDept=async(d)=>{ if(confirm('Archive department?')){ await axios.delete(`/departments/${d.id}`); await refresh(); setTab('archived'); }};
  const restoreDept=async(d)=>{ await axios.post(`/departments/${d.id}/restore`); await refresh(); };

  // Courses: open/save
  const openAddCourse=()=>{ setCourseEditing(null); setCourseForm(blankCourse); setCourseModal(true); };
  const openEditCourse=(c)=>{ setCourseEditing(c); setCourseForm({name:c.name,department_id:c.department_id,status:c.status}); setCourseModal(true); };
  const saveCourse=async()=>{
    const payload={...courseForm, department_id: courseForm.department_id===''? null : Number(courseForm.department_id)};
    if(!payload.name || !payload.department_id){ alert('Name and department are required.'); return; }
    if(courseEditing){ await axios.put(`/courses/${courseEditing.id}`, payload); }
    else { await axios.post('/courses', payload); }
    setCourseModal(false); setCourseEditing(null); setCourseForm(blankCourse); await refresh();
  };
  const delCourse=async(c)=>{ if(confirm('Archive course?')){ await axios.delete(`/courses/${c.id}`); await refresh(); setTab('archived'); }};
  const restoreCourse=async(c)=>{ await axios.post(`/courses/${c.id}/restore`); await refresh(); };

  const renderYears=()=> (
    <Section title="Academic Years" subtitle="Manage academic year periods" action={<div style={{display:'inline-flex',alignItems:'center',gap:10}}>
      <button onClick={openAddYear} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#111827',color:'#fff',borderRadius:9999,padding:'8px 14px',fontWeight:700}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Academic Year
    </button></div>}>
      <div style={{border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
        <thead>
          <tr style={{background:'#F3F4F6'}}>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Academic Years</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Start Date</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>End Date</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Status</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(years)?years:[]).map(ay=> (
            <tr key={ay.id}>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>{ay.label}</td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>{fmtDate(ay.start_date)}</td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>{fmtDate(ay.end_date)}</td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}><StatusPill value={ay.status}/></td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>
                <span style={{display:'inline-flex',gap:8}}>
                  <OutlineIconButton title="Edit" onClick={()=>openEditYear(ay)}><PencilIcon/></OutlineIconButton>
                  <OutlineIconButton title="Archive" onClick={()=>delYear(ay)}><ArchiveIcon/></OutlineIconButton>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Section>
  );

  const renderArchived=()=> (
    <Section title="Archived Items Management" subtitle="View and restore archived departments, courses, academic years, students, and faculty.">
      <div style={{display:'grid',gap:16}}>
        {/* Departments */}
        <div>
          <div style={{fontWeight:700,marginBottom:6}}>Archived Departments ({(deptsArchived||[]).length})</div>
          {(Array.isArray(deptsArchived)?deptsArchived:[]).length===0 ? (
            <div>No archived departments</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
              <tbody>
                {deptsArchived.map(d=> (
                  <tr key={d.id}>
                    <td style={{padding:8,border:'1px solid #e5e7eb'}}>{d.name}</td>
                    <td style={{padding:8,border:'1px solid #e5e7eb',width:80}}>
                      <OutlineIconButton title="Restore" onClick={()=>restoreDept(d)}>
                        <svg {...iconProps} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </OutlineIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Courses */}
        <div>
          <div style={{fontWeight:700,marginBottom:6}}>Archived Courses ({(coursesArchived||[]).length})</div>
          {(Array.isArray(coursesArchived)?coursesArchived:[]).length===0 ? (
            <div>No archived courses</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
              <tbody>
                {coursesArchived.map(c=> (
                  <tr key={c.id}>
                    <td style={{padding:8,border:'1px solid #e5e7eb'}}>{c.name}</td>
                    <td style={{padding:8,border:'1px solid #e5e7eb',width:80}}>
                      <OutlineIconButton title="Restore" onClick={()=>restoreCourse(c)}>
                        <svg {...iconProps} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </OutlineIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Academic Years */}
        <div>
          <div style={{fontWeight:700,marginBottom:6}}>Archived Academic Years ({(yearsArchived||[]).length})</div>
          {(Array.isArray(yearsArchived)?yearsArchived:[]).length===0 ? (
            <div>No archived academic years</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
              <tbody>
                {yearsArchived.map(ay=> (
                  <tr key={ay.id}>
                    <td style={{padding:8,border:'1px solid #e5e7eb'}}>{ay.label} — {fmtDate(ay.start_date)} to {fmtDate(ay.end_date)}</td>
                    <td style={{padding:8,border:'1px solid #e5e7eb',width:80}}>
                      <OutlineIconButton title="Restore" onClick={()=>restoreYear(ay)}>
                        <svg {...iconProps} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </OutlineIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Students */}
        <div>
          <div style={{fontWeight:700,marginBottom:6}}>Archived Students ({(studentsArchived||[]).length})</div>
          {(Array.isArray(studentsArchived)?studentsArchived:[]).length===0 ? (
            <div>No archived students</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
              <tbody>
                {studentsArchived.map(s=> (
                  <tr key={`${s.entity_id}-s`}>
                    <td style={{padding:8,border:'1px solid #e5e7eb'}}>{s.name || `ID ${s.entity_id}`}</td>
                    <td style={{padding:8,border:'1px solid #e5e7eb',width:80}}>
                      <OutlineIconButton title="Restore" onClick={async()=>{ await axios.post(`/students/${s.entity_id}/restore`); await refresh(); }}>
                        <svg {...iconProps} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </OutlineIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Faculty */}
        <div>
          <div style={{fontWeight:700,marginBottom:6}}>Archived Faculty ({(facultyArchived||[]).length})</div>
          {(Array.isArray(facultyArchived)?facultyArchived:[]).length===0 ? (
            <div>No archived faculty</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
              <tbody>
                {facultyArchived.map(f=> (
                  <tr key={`${f.entity_id}-f`}>
                    <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.name || `ID ${f.entity_id}`}</td>
                    <td style={{padding:8,border:'1px solid #e5e7eb',width:80}}>
                      <OutlineIconButton title="Restore" onClick={async()=>{ await axios.post(`/faculties/${f.entity_id}/restore`); await refresh(); }}>
                        <svg {...iconProps} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </OutlineIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Section>
  );

  const renderDepts=()=> (
    <Section title="Departments" subtitle="Manage your departments" action={<div style={{display:'inline-flex',alignItems:'center',gap:10}}>
      <button onClick={openAddDept} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#111827',color:'#fff',borderRadius:9999,padding:'8px 14px',fontWeight:700}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Department
    </button></div>}>
      <div style={{border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
        <thead>
          <tr style={{background:'#F3F4F6'}}>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Name</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Status</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(depts)?depts:[]).map(d=> (
            <tr key={d.id}>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>{d.name}</td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}><StatusPill value={d.status}/></td>
              <td style={{padding:8,border:'1px solid #e5e7eb'}}>
                <span style={{display:'inline-flex',gap:8}}>
                  <OutlineIconButton title="Edit" onClick={()=>openEditDept(d)}><PencilIcon/></OutlineIconButton>
                  <OutlineIconButton title="Archive" onClick={()=>delDept(d)}><ArchiveIcon/></OutlineIconButton>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Section>
  );

  const renderCourses=()=> (
    <Section title="Courses" subtitle="Manage courses" action={<div style={{display:'inline-flex',alignItems:'center',gap:10}}>
      <button onClick={openAddCourse} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#111827',color:'#fff',borderRadius:9999,padding:'8px 14px',fontWeight:700}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Course
    </button></div>}>
      <div style={{border:'1px solid #E5E7EB',borderRadius:10,overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
        <thead>
          <tr style={{background:'#F3F4F6'}}>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Name</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Department</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Status</th>
            <th style={{padding:8,border:'1px solid #e5e7eb'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(courses)?courses:[]).map(c=> {
            const dep=depts.find(d=>d.id===c.department_id);
            return (
              <tr key={c.id}>
                <td style={{padding:8,border:'1px solid #e5e7eb'}}>{c.name}</td>
                <td style={{padding:8,border:'1px solid #e5e7eb'}}>{dep?dep.name:'—'}</td>
                <td style={{padding:8,border:'1px solid #e5e7eb'}}><StatusPill value={c.status}/></td>
                <td style={{padding:8,border:'1px solid #e5e7eb'}}>
                  <span style={{display:'inline-flex',gap:8}}>
                    <OutlineIconButton title="Edit" onClick={()=>openEditCourse(c)}><PencilIcon/></OutlineIconButton>
                    <OutlineIconButton title="Archive" onClick={()=>delCourse(c)}><ArchiveIcon/></OutlineIconButton>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </Section>
  );

  return (
    <div>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:20,fontWeight:800}}>System Settings</div>
        <div style={{color:'#6B7280',fontSize:13}}>Manage academic years, departments, and courses</div>
      </div>
      <div style={{marginTop:12,border:'1px solid #E5E7EB',padding:6,borderRadius:9999,display:'inline-flex',gap:6,background:'#F3F4F6'}}>
        <button onClick={()=>setTab('years')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='years'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Academic Years</button>
        <button onClick={()=>setTab('depts')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='depts'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Departments</button>
        <button onClick={()=>setTab('courses')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='courses'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Courses</button>
        <button onClick={()=>setTab('archived')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='archived'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Archived</button>
      </div>

      {loading && <div style={{marginTop:12}}>Loading…</div>}
      {!loading && (
        <div>
          {tab==='years' && renderYears()}
          {tab==='depts' && renderDepts()}
          {tab==='courses' && renderCourses()}
          {tab==='archived' && renderArchived()}
        </div>
      )}

      {/* Modals */}
      {yearModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:16,borderRadius:12,width:520}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3>{yearEditing? 'Edit Academic Year' : 'Add Academic Year'}</h3>
              <button onClick={()=>{setYearModal(false); setYearEditing(null);}}>✖</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <input value={yearForm.label} onChange={e=>{
                const label=e.target.value; const yrs=yearsFromLabel(label);
                let {start_date,end_date}=yearForm;
                if(yrs){
                  if(start_date){
                    start_date = mergeWithYear(start_date, yrs.start);
                  }
                  if(end_date){
                    end_date = mergeWithYear(end_date, yrs.end);
                  }
                }
                setYearForm({...yearForm,label,start_date,end_date});
              }} style={{gridColumn:'1 / span 2',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:10}}/>
              <input type="date" value={yearForm.start_date} onChange={e=>{
                const v=e.target.value; const d=new Date(v);
                let nextLabel=yearForm.label; const yrs=yearsFromLabel(nextLabel);
                if(!yrs && v){ const y=d.getFullYear(); if(!Number.isNaN(y)&&y>0){ nextLabel=`${y}-${y+1}`; }}
                const finalYears = yearsFromLabel(nextLabel);
                const nextStart = finalYears? mergeWithYear(v, finalYears.start) : v;
                setYearForm({...yearForm,start_date:nextStart,label:nextLabel});
              }} style={{padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:10}}/>
              <input type="date" value={yearForm.end_date} onChange={e=>{
                const v=e.target.value; const nextYears = yearsFromLabel(yearForm.label);
                const nextEnd = nextYears? mergeWithYear(v, nextYears.end) : v;
                setYearForm({...yearForm,end_date:nextEnd});
              }} style={{padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:10}}/>
              <select value={yearForm.status} onChange={e=>setYearForm({...yearForm,status:e.target.value})} style={{gridColumn:'1 / span 2',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:10}}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button onClick={()=>{setYearModal(false); setYearEditing(null);}}>Cancel</button>
              <button onClick={saveYear} style={{background:'#111827',color:'#fff',borderRadius:6,padding:'6px 10px'}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deptModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:16,borderRadius:12,width:420}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3>{deptEditing? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={()=>{setDeptModal(false); setDeptEditing(null);}}>✖</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:12}}>
              <input placeholder="Department name" value={deptForm.name} onChange={e=>setDeptForm({...deptForm,name:e.target.value})}/>
              <select value={deptForm.status} onChange={e=>setDeptForm({...deptForm,status:e.target.value})}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button onClick={()=>{setDeptModal(false); setDeptEditing(null);}}>Cancel</button>
              <button onClick={saveDept} style={{background:'#111827',color:'#fff',borderRadius:6,padding:'6px 10px'}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {courseModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:16,borderRadius:12,width:520}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3>{courseEditing? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={()=>{setCourseModal(false); setCourseEditing(null);}}>✖</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <input placeholder="Course name" value={courseForm.name} onChange={e=>setCourseForm({...courseForm,name:e.target.value})} style={{gridColumn:'1 / span 2'}}/>
              <select value={courseForm.department_id||''} onChange={e=>setCourseForm({...courseForm,department_id:e.target.value})}>
                <option value="">Select Department</option>
                {(Array.isArray(depts)?depts:[]).map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={courseForm.status} onChange={e=>setCourseForm({...courseForm,status:e.target.value})}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button onClick={()=>{setCourseModal(false); setCourseEditing(null);}}>Cancel</button>
              <button onClick={saveCourse} style={{background:'#111827',color:'#fff',borderRadius:6,padding:'6px 10px'}}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Archived Tab */}
      {/* Rendered via renderArchived() above */}
    </div>
  );
}
