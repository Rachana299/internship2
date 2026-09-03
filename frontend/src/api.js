import axios from 'axios';
export const API=axios.create({baseURL:'http://localhost:5000/api'}); API.interceptors.request.use(c=>{const t=localStorage.getItem('token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
export const fileUrl=p=>p?`http://localhost:5000${p}`:'';
