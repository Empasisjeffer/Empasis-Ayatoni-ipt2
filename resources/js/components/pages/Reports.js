import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function Reports(){
  const [students,setStudents]=useState([]);
  const [faculty,setFaculty]=useState([]);
  const [courses,setCourses]=useState([]);
  const [depts,setDepts]=useState([]);

  // filters
  const [sFilters,setSFilters]=useState({ course:'All Courses', dept:'All Departments', year:'All Academic Years' });
  const [fFilters,setFFilters]=useState({ dept:'All Departments', type:'All Employment Types' });
  const [activeTab,setActiveTab]=useState('students'); // 'students' | 'faculty'
  const [density,setDensity]=useState('default'); // 'default' | 'compact' | 'ultra'
  const [iconSize,setIconSize]=useState('md'); // 'sm' | 'md' | 'lg'

  const sz = iconSize==='sm'?14:iconSize==='lg'?18:16;

  const toArray=(resp)=>{
    const data = resp && resp.data;
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.data)) return data.data;
    return [];
  };

  useEffect(()=>{
    const load=async()=>{
      try{
        const [s,f,c,d]=await Promise.all([
          axios.get('/students'),
          axios.get('/faculties'),
          axios.get('/courses'),
          axios.get('/departments'),
        ]);
        setStudents(toArray(s));
        setFaculty(toArray(f));
        setCourses(toArray(c));
        setDepts(toArray(d));
      }catch(e){
        console.error('Failed to load data for reports',e);
      }
    };
    load();
  },[]);

  // Auto-select Department when a Course is chosen (but keep dept editable)
  useEffect(()=>{
    if(sFilters.course && sFilters.course !== 'All Courses'){
      const c = (courses||[]).find(x=> String(x.name)===String(sFilters.course));
      if(c){
        const d = (depts||[]).find(dd=> String(dd.id)===String(c.department_id));
        const deptName = d? d.name : undefined;
        if(deptName && sFilters.dept !== deptName){
          setSFilters(v=> ({...v, dept: deptName}));
        }
      }
    }
  },[sFilters.course, courses, depts]);

  // derive unique lists
  const courseOptions = useMemo(()=>['All Courses', ...[...new Set((courses||[]).map(c=>c.name))]], [courses]);
  const deptOptions = useMemo(()=>['All Departments', ...[...new Set((depts||[]).map(d=>d.name))]], [depts]);
  const yearOptions = useMemo(()=>{
    const years = new Set();
    (students||[]).forEach(s=>{
      if (s.academic_year) years.add(String(s.academic_year));
      else if (s.year) years.add(String(s.year));
    });
    return ['All Academic Years', ...Array.from(years)];
  },[students]);
  const empTypeOptions = ['All Employment Types','Full-time','Part-time','Contract'];

  // helpers
  const resolveCourseName = (s)=>{
    if (!s) return undefined;
    const text = s.course_name || s.course;
    if (text && String(text).trim()!=='') return text;
    const c = (courses||[]).find(x=> String(x.id)===String(s.course_id));
    return c? c.name : undefined;
  };

  // filtered data
  const filteredStudents = useMemo(()=>{
    return (students||[]).filter(s=>{
      const resolvedCourse = resolveCourseName(s);
      const okCourse = sFilters.course==='All Courses' || resolvedCourse===sFilters.course || s.course===sFilters.course || s.course_name===sFilters.course;
      const deptName = (()=>{
        const d=(depts||[]).find(x=> String(x.id)===String(s.department_id));
        return d?d.name: (s.department_name||s.department);
      })();
      const okDept = sFilters.dept==='All Departments' || deptName===sFilters.dept;
      const yearVal = s.academic_year ?? s.year;
      const okYear = sFilters.year==='All Academic Years' || String(yearVal)===String(sFilters.year);
      return okCourse && okDept && okYear;
    });
  },[students,sFilters,depts]);

  const resolveDeptName = (deptId)=>{
    const d=(depts||[]).find(x=> String(x.id)===String(deptId));
    return d?d.name:undefined;
  };
  const filteredFaculty = useMemo(()=>{
    return (faculty||[]).filter(fa=>{
      const deptName = resolveDeptName(fa.department_id) || fa.department_name || fa.department;
      const okDept = fFilters.dept==='All Departments' || deptName===fFilters.dept;
      const okType = fFilters.type==='All Employment Types' || String(fa.employment_type||'').toLowerCase()===String(fFilters.type).toLowerCase();
      return okDept && okType;
    });
  },[faculty,fFilters,depts]);

  // stats for tiles
  const studentStats = useMemo(()=>{
    const byCourse = {};
    filteredStudents.forEach(s=>{ const k=resolveCourseName(s)||'Unknown'; byCourse[k]=(byCourse[k]||0)+1; });
    const byDept = {};
    filteredStudents.forEach(s=>{ const k=s.department_name||s.department||'Unknown'; byDept[k]=(byDept[k]||0)+1; });
    const byYear = {};
    filteredStudents.forEach(s=>{ const k=String(s.academic_year||'Unknown'); byYear[k]=(byYear[k]||0)+1; });
    return { total: filteredStudents.length, byCourse, byDept, byYear };
  },[filteredStudents]);

  const facultyStats = useMemo(()=>{
    const byDept = {};
    filteredFaculty.forEach(f=>{ const k=resolveDeptName(f.department_id)||f.department_name||f.department||'Unknown'; byDept[k]=(byDept[k]||0)+1; });
    const byType = {};
    filteredFaculty.forEach(f=>{ const k=String(f.employment_type||'Unknown'); byType[k]=(byType[k]||0)+1; });
    return { total: filteredFaculty.length, byDept, byType };
  },[filteredFaculty]);

  const Tile = ({ title, value, color='#60A5FA', extra, icon }) => (
    <div className="stat-card">
      <div className="stat-card__title" style={{display:'flex',alignItems:'center',gap:8}}>
        {icon}
        <span>{title}</span>
      </div>
      <div className="stat-card__value" style={{color}}>{value}</div>
      {extra}
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div className="panel">
      <div className="panel__title">{title}</div>
      {children}
    </div>
  );

  const PreviewHeader = (
    <div className="reports-toolbar">
      <div>
        <div style={{fontWeight:800, fontSize:16}}>Student Report Preview</div>
        <div style={{color:'#94a3b8', fontSize:12}}>Total {activeTab==='students'?'Students':'Faculty'}: {activeTab==='students'?studentStats.total:facultyStats.total}</div>
      </div>
      <div className="reports-tabs">
        <button className={`tab ${activeTab==='students'?'active':''}`} onClick={()=>setActiveTab('students')}>Student Report</button>
        <button className={`tab ${activeTab==='faculty'?'active':''}`} onClick={()=>setActiveTab('faculty')}>Faculty Report</button>
      </div>
    </div>
  );

  const downloadBlob=(content, filename, type='text/plain')=>{
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };

  const toCsv=(rows)=> rows.map(r=> r.map(v=>{
    if(v==null) return '';
    const s=String(v).replaceAll('"','""');
    return /[",\n]/.test(s)?`"${s}"`:s;
  }).join(',')).join('\n');

  const exportCSV=()=>{
    if(activeTab==='students'){
      const headers=['Student ID','Name','Course','Department','Gender','Academic Year'];
      const rows=filteredStudents.map(s=>[
        s.student_id||s.id,
        `${s.firstname||''} ${s.middlename||''} ${s.lastname||''}`.replace(/\s+/g,' ').trim(),
        resolveCourseName(s)||'',
        ((()=>{ const d=(depts||[]).find(x=> String(x.id)===String(s.department_id)); return d?d.name:(s.department_name||s.department||''); })()),
        s.gender || '',
        s.academic_year ?? s.year ?? ''
      ]);
      downloadBlob([headers, ...rows].map(r=>r.join(',')).join('\n'), `students_report_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    }else{
      const headers=['Faculty ID','Name','Department','Gender','Employment Type'];
      const rows=filteredFaculty.map(f=>[
        f.faculty_id||f.id,
        (f.name||`${f.firstname||''} ${f.lastname||''}`).trim(),
        ((()=>{ const d=(depts||[]).find(x=> String(x.id)===String(f.department_id)); return d?d.name:(f.department_name||f.department||''); })()),
        f.gender || '',
        f.employment_type||''
      ]);
      downloadBlob([headers, ...rows].map(r=>r.join(',')).join('\n'), `faculty_report_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    }
  };

  const exportPDF=()=>{
    // Open a minimal print-ready window; users can save as PDF
    const title = activeTab==='students'?'Student Report':'Faculty Report';
    const style = `
      <style>
        body{font-family: Arial, sans-serif; padding:16px;}
        h2{margin:0 0 12px}
        table{width:100%; border-collapse:collapse;}
        th,td{border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; text-align:left}
        thead{background:#f8fafc}
      </style>`;
    const buildRows = ()=>{
      if(activeTab==='students'){
        const header = '<tr><th>Student ID</th><th>Name</th><th>Course</th><th>Department</th><th>Gender</th><th>Academic Year</th></tr>';
        const rows = filteredStudents.map(s=>{
          const dept = ((()=>{ const d=(depts||[]).find(x=> String(x.id)===String(s.department_id)); return d?d.name:(s.department_name||s.department||''); })());
          const name = `${s.firstname||''} ${s.middlename||''} ${s.lastname||''}`.replace(/\s+/g,' ').trim();
          const year = s.academic_year ?? s.year ?? '';
          const course = resolveCourseName(s)||'';
          const gender = s.gender || '';
          return `<tr><td>${s.student_id||s.id||''}</td><td>${name}</td><td>${course}</td><td>${dept}</td><td>${gender}</td><td>${year}</td></tr>`;
        }).join('');
        return `<thead>${header}</thead><tbody>${rows}</tbody>`;
      }else{
        const header = '<tr><th>Faculty ID</th><th>Name</th><th>Department</th><th>Gender</th><th>Employment Type</th></tr>';
        const rows = filteredFaculty.map(f=>{
          const dept = ((()=>{ const d=(depts||[]).find(x=> String(x.id)===String(f.department_id)); return d?d.name:(f.department_name||f.department||''); })());
          const name = (f.name||`${f.firstname||''} ${f.lastname||''}`).trim();
          return `<tr><td>${f.faculty_id||f.id||''}</td><td>${name}</td><td>${dept||''}</td><td>${f.gender||''}</td><td>${f.employment_type||''}</td></tr>`;
        }).join('');
        return `<thead>${header}</thead><tbody>${rows}</tbody>`;
      }
    };
    const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body><h2>${title}</h2><table>${buildRows()}</table></body></html>`;
    const win = window.open('', '_blank'); if(!win){ alert('Popup blocked. Please allow popups to export PDF.'); return; }
    win.document.open(); win.document.write(html); win.document.close();
    win.focus(); win.print();
  };

  return (
    <div className={`reports-container reports--bw ${density==='compact'?'dense-compact':''} ${density==='ultra'?'dense-ultra':''}`}>
      <div className="reports-header sticky">
        <div className="header-content">
          <h1>Reports</h1>
          <div className="subtitle">Generate and preview student and faculty reports</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn" onClick={()=>setDensity(d=> d==='default'?'compact': d==='compact'?'ultra':'default')}>
            {density==='default' && (<><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>Comfortable</>)}
            {density==='compact' && (<><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="4" rx="2"/><rect x="4" y="15" width="16" height="4" rx="2"/></svg>Compact</>)}
            {density==='ultra' && (<><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="6" width="14" height="3" rx="1.5"/><rect x="5" y="15" width="14" height="3" rx="1.5"/></svg>Ultra</>)}
          </button>
          <button className="btn" onClick={()=>setIconSize(s => s==='sm'?'md': s==='md'?'lg':'sm')}>
            {iconSize.toUpperCase()} icons
          </button>
        </div>
      </div>

      <div className="reports-panels">
        {/* Student Filters */}
        <div className="filter-panel">
          <div className="panel-title">Filter Options</div>
          <div className="panel-body">
            <label className="filter-group">
              <span>Course</span>
              <select value={sFilters.course} onChange={e=>setSFilters(v=>({...v,course:e.target.value}))}>
                {courseOptions.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="filter-group">
              <span>Department</span>
              <select value={sFilters.dept} onChange={e=>setSFilters(v=>({...v,dept:e.target.value}))}>
                {deptOptions.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="filter-group">
              <span>Academic Year</span>
              <select value={sFilters.year} onChange={e=>setSFilters(v=>({...v,year:e.target.value}))}>
                {yearOptions.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="panel-actions">
            <button className="btn btn-primary btn-block">
              <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview Report
            </button>
            <div className="panel-export">
              <button className="btn btn-outline" onClick={exportPDF}>
                <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                PDF
              </button>
              <button className="btn btn-outline" onClick={exportCSV}>
                <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l6-6"/><path d="M15 15l-6-6"/></svg>
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Filters */}
        <div className="filter-panel">
          <div className="panel-title">Filter Options</div>
          <div className="panel-body">
            <label className="filter-group">
              <span>Department</span>
              <select value={fFilters.dept} onChange={e=>setFFilters(v=>({...v,dept:e.target.value}))}>
                {deptOptions.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="filter-group">
              <span>Employment Type</span>
              <select value={fFilters.type} onChange={e=>setFFilters(v=>({...v,type:e.target.value}))}>
                {empTypeOptions.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="panel-actions">
            <button className="btn btn-primary btn-block">Preview Report</button>
            <div className="panel-export">
              <button className="btn btn-outline" onClick={exportPDF}>PDF</button>
              <button className="btn btn-outline" onClick={exportCSV}>Excel</button>
            </div>
          </div>
        </div>
      </div>

      {PreviewHeader}

      {/* Tiles */}
      {activeTab==='students' ? (
        <div className="card-grid fade-in">
          <Tile title="Total Students" value={studentStats.total} icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <Tile title="By Course" value={`${Object.keys(studentStats.byCourse).length} courses`} color="#10B981" extra={
            <div style={{marginTop:8,fontSize:12,color:'#9CA3AF'}}>
              {Object.entries(studentStats.byCourse).slice(0,2).map(([k,v])=> (<div key={k}>{k}: {v}</div>))}
            </div>
          } icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22h11A2.5 2.5 0 0 0 20 19.5V6H4z"/><path d="M4 6l2-3h12l2 3"/></svg>} />
          <Tile title="By Department" value={`${Object.keys(studentStats.byDept).length} departments`} color="#A855F7" extra={
            <div style={{marginTop:8,fontSize:12,color:'#9CA3AF'}}>
              {Object.entries(studentStats.byDept).slice(0,2).map(([k,v])=> (<div key={k}>{k}: {v}</div>))}
            </div>
          } icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3z"/><path d="M3 7h18v4H3z"/><path d="M3 11h18v10H3z"/></svg>} />
          <Tile title="Academic Years" value={`${Object.keys(studentStats.byYear).length} years`} color="#F59E0B" extra={
            <div style={{marginTop:8,fontSize:12,color:'#9CA3AF'}}>
              {Object.entries(studentStats.byYear).slice(0,3).map(([k,v])=> (<div key={k}>{k}: {v}</div>))}
            </div>
          } icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>} />
        </div>
      ) : (
        <div className="card-grid fade-in">
          <Tile title="Total Faculty" value={facultyStats.total} icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
          <Tile title="By Department" value={`${Object.keys(facultyStats.byDept).length} departments`} color="#A855F7" extra={
            <div style={{marginTop:8,fontSize:12,color:'#9CA3AF'}}>
              {Object.entries(facultyStats.byDept).slice(0,2).map(([k,v])=> (<div key={k}>{k}: {v}</div>))}
            </div>
          } icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3z"/><path d="M3 7h18v4H3z"/><path d="M3 11h18v10H3z"/></svg>} />
          <Tile title="By Employment Type" value={`${Object.keys(facultyStats.byType).length} types`} color="#10B981" extra={
            <div style={{marginTop:8,fontSize:12,color:'#9CA3AF'}}>
              {Object.entries(facultyStats.byType).slice(0,3).map(([k,v])=> (<div key={k}>{k}: {v}</div>))}
            </div>
          } icon={<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13V7a4 4 0 0 0-8 0v6"/><rect x="2" y="13" width="20" height="8" rx="2"/></svg>} />
        </div>
      )}

      {/* Table */}
      <div className="panel" style={{marginTop:16}}>
        <div className="table-panel fade-in">
          {activeTab==='students' ? (
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:120}}>Student ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Gender</th>
                  <th>Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s,idx)=> (
                  <tr key={s.id||idx}>
                    <td>{s.student_id||s.id}</td>
                    <td>{`${s.firstname||''} ${s.lastname||''}`.trim()}</td>
                    <td>{resolveCourseName(s)||''}</td>
                    <td>{(() => { const d=(depts||[]).find(x=> String(x.id)===String(s.department_id)); return d?d.name:(s.department_name||s.department||''); })()}</td>
                    <td>{s.gender||''}</td>
                    <td>{s.academic_year ?? s.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:120}}>Faculty ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Gender</th>
                  <th>Employment Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((f,idx)=> (
                  <tr key={f.id||idx}>
                    <td>{f.faculty_id||f.id}</td>
                    <td>{(f.name||`${f.firstname||''} ${f.lastname||''}`).trim()}</td>
                    <td>{resolveDeptName(f.department_id) || f.department_name || f.department || ''}</td>
                    <td>{f.gender||''}</td>
                    <td>{f.employment_type||'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
