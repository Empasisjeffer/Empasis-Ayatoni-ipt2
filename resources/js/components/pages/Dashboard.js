import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard(){
  const [students,setStudents]=useState([]);
  const [faculty,setFaculty]=useState([]);
  const [courses,setCourses]=useState([]);
  const [depts,setDepts]=useState([]);

  const toArray=(resp)=>{
    const data = resp && resp.data;
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const refresh=async()=>{
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
  };

  useEffect(()=>{refresh()},[]);

  const Card=({title,value,icon})=> (
    <div className="stat-card">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );

  // Lightweight SVG Pie Chart (no external deps)
  const PieChart = ({ data, size=220, strokeWidth=36 }) => {
    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    const cx = size/2, cy = size/2;
    const r = (size - strokeWidth) / 2;
    const C = 2 * Math.PI * r;
    if (total === 0) {
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#6B7280">No data</text>
        </svg>
      );
    }
    let offset = 0; // stroke-dashoffset accumulative
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           style={{display:'block'}}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {data.map((d, i) => {
            const frac = (d.value || 0) / total;
            const dash = Math.max(0, Math.min(C, frac * C));
            const circle = (
              <circle key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700">{total}</text>
      </svg>
    );
  };

  const activeCourses = courses.filter(x=>x.status==='Active').length;
  const activeDepts = depts.filter(x=>x.status==='Active').length;
  const pieData = [
    { label: 'Students', value: students.length, color: '#111827' },
    { label: 'Faculty', value: faculty.length, color: '#3B82F6' },
    { label: 'Active Courses', value: activeCourses, color: '#10B981' },
    { label: 'Active Depts', value: activeDepts, color: '#F59E0B' },
  ];

  return (
    <div>
      <h2 className="page-title">Dashboard Overview</h2>
      <div className="card-grid">
        <Card title="Total Students" value={students.length}/>
        <Card title="Total Faculty" value={faculty.length}/>
        <Card title="Active Course" value={activeCourses}/>
        <Card title="Active Departments" value={activeDepts}/>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <div className="panel__title">Overview Breakdown</div>
        <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
          <PieChart data={pieData} />
          <div style={{display:'grid',gap:8}}>
            {pieData.map((d,i)=> (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:12,height:12,background:d.color,display:'inline-block',borderRadius:2}}/>
                <span style={{minWidth:140}}>{d.label}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16,marginTop:16}}>
        {/* Students: ID, Name */}
        <div className="panel">
          <div className="panel__title">Students</div>
          <div className="table-panel">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:80}}>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(students)?students:[]).map(s=> (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{(s.firstname||'')+ ' ' + (s.lastname||'')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Courses: list all */}
        <div className="panel">
          <div className="panel__title">Courses</div>
          <div className="table-panel">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(courses)?courses:[]).map(c=> (
                  <tr key={c.id}>
                    <td>{String(c.name||'').replace(/^\s*:\s*/, '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
