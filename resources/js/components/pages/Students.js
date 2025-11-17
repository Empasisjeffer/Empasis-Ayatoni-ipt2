import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Badge from '../Badge';

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

export default function Students(){
  const [students,setStudents]=useState([]);
  const [depts,setDepts]=useState([]);
  const [courses,setCourses]=useState([]);
  const [years,setYears]=useState([]);
  const [q,setQ]=useState('');
  const [deptFilter,setDeptFilter]=useState('all');
  const [showModal,setShowModal]=useState(false);
  const blank={student_id:'',firstname:'',middlename:'',lastname:'',email:'',department_id:'',course_id:'',year:'',student_category:'',gender:'',status:'Active',phone:'',enrollment_date:'',address:''};
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState(null);
  const [error,setError]=useState('');
  const navigate = useNavigate();

  const toArray=(resp)=>{
    const data = resp && resp.data;
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchAll = async ()=>{
    const [s,d,c,y]=await Promise.all([
      axios.get('/students',{ params: { q, department_id: deptFilter==='all'?undefined:deptFilter } }),
      axios.get('/departments'),
      axios.get('/courses'),
      axios.get('/academic-years'),
    ]);
    setStudents(toArray(s));
    setDepts(toArray(d));
    setCourses(toArray(c));
    setYears(toArray(y));
  };

  useEffect(()=>{fetchAll()},[q,deptFilter]);

  const filtered = students; // server-side filtered

  const openAdd = ()=>{ setForm(blank); setEditing(null); setShowModal(true); };
  const openEdit = (s)=>{ setForm({ ...blank, ...s}); setEditing(s); setShowModal(true); };
  const closeModal = ()=>{ setShowModal(false); setEditing(null); };

  const save = async ()=>{
    setError('');
    // Simple client-side validation to match backend
    if(!form.firstname || !form.lastname || !form.email){ setError('First name, last name, and email are required.'); return; }
    if(!form.year){ setError('Year is required.'); return; }
    if(form.department_id==='' || form.department_id===null){ setError('Department is required.'); return; }
    const payload={
      ...form,
      firstname: (form.firstname||'').trim(),
      middlename: ((form.middlename||'').trim()||'')||undefined,
      lastname: (form.lastname||'').trim(),
      email: (form.email||'').trim(),
      student_category: (form.student_category||'').trim()||null,
      gender: (form.gender||'') || null,
      student_id: (form.student_id||'').trim()||null,
      department_id: form.department_id===''? null : form.department_id,
      course_id: form.course_id===''? null : form.course_id,
    };
    try{
      if(editing){ await axios.put(`/students/${editing.id}`, payload); }
      else { await axios.post('/students', payload); }
      closeModal(); await fetchAll();
    }catch(e){
      if(e.response && e.response.data){
        const data = e.response.data;
        // Prefer first Laravel validation error if available
        if(data && data.errors && typeof data.errors === 'object'){
          const firstField = Object.keys(data.errors)[0];
          const firstMsg = firstField && Array.isArray(data.errors[firstField]) ? data.errors[firstField][0] : null;
          setError(firstMsg || data.message || 'Validation error');
        }else{
          setError(typeof data === 'string' ? data : (data.message || 'Validation error'));
        }
      }else{
        setError('Network or server error.');
      }
    }
  };
  const remove = async (s)=>{ if(confirm('Archive student?')){ await axios.delete(`/students/${s.id}`); navigate('/settings?tab=archived'); } };

  const StatusPill=({value})=>(<span style={{background:value==='Active'?'#DCFCE7':'#E5E7EB',borderRadius:8,padding:'2px 8px',fontSize:12}}>{value||'—'}</span>);

  return (
    <div>
      <h2>Students Management</h2>
      <div style={{marginTop:12}}>
        <div style={{border:'1px solid #e5e7eb',padding:12,borderRadius:6}}>
          <div style={{marginBottom:8,display:'flex',gap:12,alignItems:'center'}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Students..." style={{width:300,padding:8,borderRadius:20,border:'1px solid #e5e7eb'}}/>
            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #e5e7eb'}}>
              <option value="all">All Department</option>
              {(Array.isArray(depts)?depts:[]).map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={openAdd} style={{marginLeft:'auto',background:'#000',color:'#fff',borderRadius:8,padding:'6px 10px'}}>+ Add Student</button>
            {/* Show Archived removed per request */}
          </div>

          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8fafc'}}>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Student ID</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Student</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Department</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Course</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Gender</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Year</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Category</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Status</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(filtered) || filtered.length===0)?(
                <tr><td colSpan={8} style={{padding:16,textAlign:'center'}}>No students yet.</td></tr>
              ):(
                filtered.map(s=> {
                  const d=(depts||[]).find(x=> String(x.id)===String(s.department_id));
                  const c=(courses||[]).find(x=> String(x.id)===String(s.course_id));
                  return (
                    <tr key={s.id}>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{s.student_id || '—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{[s.firstname,s.middlename,s.lastname].filter(Boolean).join(' ')}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{d?d.name:'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{c?c.name:'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{s.gender||'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{s.year||'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{s.student_category || '—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}><Badge value={s.status}/></td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>
                        <span style={{display:'inline-flex',gap:6}}>
                          <IconButton title="Edit" onClick={()=>openEdit(s)}><PencilIcon/></IconButton>
                          <IconButton title="Archive" onClick={()=>remove(s)}><ArchiveIcon/></IconButton>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls removed per request */}

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto',overflowX:'hidden',padding:'24px 12px'}}>
          <div style={{background:'#fff',padding:16,borderRadius:8,width:560,maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3>{editing?'Edit Student':'Add New Student'}</h3>
              <button onClick={closeModal}>✖</button>
            </div>
            {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#991B1B',padding:8,borderRadius:6,marginBottom:8,fontSize:12}}>{error}</div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <input placeholder="Student ID" value={form.student_id||''} onChange={e=>setForm({...form,student_id:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="First name" value={form.firstname} onChange={e=>setForm({...form,firstname:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="Middle name" value={form.middlename||''} onChange={e=>setForm({...form,middlename:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="Last name" value={form.lastname} onChange={e=>setForm({...form,lastname:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <select value={form.department_id||''} onChange={e=>{
                const v=e.target.value; setForm({...form,department_id: v===''? '': Number(v)});
              }} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Department</option>
                {(Array.isArray(depts)?depts:[]).map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={form.course_id||''} onChange={e=>{
                const v=e.target.value;
                let next={...form,course_id: v===''? '': Number(v)};
                if(v!==''){
                  const found=(Array.isArray(courses)?courses:[]).find(c=> String(c.id)===String(v));
                  if(found && found.department_id!=null){ next.department_id=Number(found.department_id); }
                }
                setForm(next);
              }} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Course</option>
                {(Array.isArray(courses)?courses:[]).filter(c=>!form.department_id || String(c.department_id)===String(form.department_id)).map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.year||''} onChange={e=>setForm({...form,year:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Academic Year</option>
                {(Array.isArray(years)?years:[])
                  .filter(y=> (y.status||'').toLowerCase()==='active')
                  .map(y=> <option key={y.id} value={y.label}>{y.label}</option>)}
              </select>
              <select value={form.student_category||''} onChange={e=>setForm({...form,student_category:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Category</option>
                <option>Regular</option>
                <option>Irregular</option>
                <option>Transfer</option>
                <option>Scholar</option>
                <option>Working Student</option>
                <option>Other</option>
              </select>
              <select value={form.gender||''} onChange={e=>setForm({...form,gender:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <input type="date" placeholder="Enrollment Date" value={form.enrollment_date||''} onChange={e=>setForm({...form,enrollment_date:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <textarea placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{gridColumn:'1 / span 2',minWidth:0,width:'100%'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button onClick={closeModal}>Cancel</button>
              <button onClick={save} style={{background:'#000',color:'#fff',borderRadius:6,padding:'6px 10px'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
