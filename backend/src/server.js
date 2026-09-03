import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {User,Patient,Doctor,Department,Appointment,Prescription,Report} from './models.js';
import {auth,allow,sign} from './auth.js';

const app=express();
const port=Number(process.env.PORT||5000);
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const uploadDir=path.join(__dirname,'..','uploads');
fs.mkdirSync(uploadDir,{recursive:true});
const upload=multer({dest:uploadDir});

app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));
app.use(express.json());
app.use('/uploads',express.static(uploadDir));

const publicUser=user=>({id:user._id,name:user.name,email:user.email,role:user.role,phone:user.phone,address:user.address});
const populateAppointment=query=>query.populate({path:'patient',populate:{path:'user',select:'name email phone'}}).populate({path:'doctor',populate:{path:'user',select:'name email'}}).populate('department');

app.get('/api/health',(req,res)=>res.json({ok:true}));

app.post('/api/auth/register',async(req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:'Name, email and password are required'});
  if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});
  const user=await User.create({name,email,password:await bcrypt.hash(password,10),role:'patient'});
  await Patient.create({user:user._id});
  res.status(201).json({token:sign(user)});
});
app.post('/api/auth/login',async(req,res)=>{
  const user=await User.findOne({email:req.body.email});
  if(!user||!(await bcrypt.compare(req.body.password||'',user.password)))return res.status(401).json({message:'Invalid email or password'});
  res.json({token:sign(user)});
});
app.get('/api/auth/me',auth,(req,res)=>res.json(publicUser(req.user)));

app.get('/api/departments',auth,async(req,res)=>res.json(await Department.find().sort({name:1})));
app.get('/api/doctors',auth,async(req,res)=>res.json(await Doctor.find().populate('user','name email phone').populate('department')));
app.get('/api/patients',auth,allow('admin','doctor'),async(req,res)=>{
  const users=await User.find({role:'patient',...(req.query.q?{name:new RegExp(req.query.q,'i')}: {})}).select('_id');
  res.json(await Patient.find({user:{$in:users.map(user=>user._id)}}).populate('user','name email phone'));
});

app.get('/api/appointments',auth,async(req,res)=>{
  let filter={};
  if(req.user.role==='patient'){const patient=await Patient.findOne({user:req.user._id});filter.patient=patient?._id;}
  if(req.user.role==='doctor'){const doctor=await Doctor.findOne({user:req.user._id});filter.doctor=doctor?._id;}
  res.json(await populateAppointment(Appointment.find(filter).sort({date:1})));
});
app.get('/api/admin/appointments',auth,allow('admin'),async(req,res)=>res.json(await populateAppointment(Appointment.find().sort({date:1}))));
app.post('/api/appointments',auth,allow('patient'),async(req,res)=>{
  const {doctor,date,reason}=req.body; const patient=await Patient.findOne({user:req.user._id});
  const selected=await Doctor.findById(doctor); if(!patient||!selected)return res.status(400).json({message:'Invalid patient or doctor'});
  if(new Date(date)<=new Date())return res.status(400).json({message:'Appointment must be in the future'});
  if(await Appointment.findOne({doctor,date:new Date(date),status:{$nin:['cancelled','completed']}}))return res.status(409).json({message:'Doctor is already booked at this time'});
  res.status(201).json(await Appointment.create({patient:patient._id,doctor,department:selected.department,date,reason}));
});
app.patch('/api/appointments/:id',auth,allow('doctor','admin'),async(req,res)=>res.json(await Appointment.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true})));

app.get('/api/reports',auth,async(req,res)=>{const patient=await Patient.findOne({user:req.user._id});res.json(await Report.find({patient:patient?._id}).sort({createdAt:-1}));});
app.post('/api/reports',auth,allow('patient'),upload.single('report'),async(req,res)=>{const patient=await Patient.findOne({user:req.user._id});if(!req.file||!patient)return res.status(400).json({message:'Report file is required'});res.status(201).json(await Report.create({patient:patient._id,originalName:req.file.originalname,fileName:req.file.filename,mimeType:req.file.mimetype,path:`/uploads/${req.file.filename}`}));});

app.get('/api/prescriptions',auth,async(req,res)=>{let filter={};if(req.user.role==='patient'){const patient=await Patient.findOne({user:req.user._id});filter.patient=patient?._id;}if(req.user.role==='doctor'){const doctor=await Doctor.findOne({user:req.user._id});filter.doctor=doctor?._id;}res.json(await Prescription.find(filter).populate({path:'patient',populate:{path:'user',select:'name'}}).populate({path:'doctor',populate:{path:'user',select:'name'}}).populate('appointment'));});
app.post('/api/prescriptions',auth,allow('doctor'),async(req,res)=>{const doctor=await Doctor.findOne({user:req.user._id});const appointment=await Appointment.findById(req.body.appointment);if(!doctor||!appointment)return res.status(400).json({message:'Invalid appointment'});res.status(201).json(await Prescription.create({...req.body,doctor:doctor._id,patient:appointment.patient}));});
app.post('/api/admin/doctors',auth,allow('admin'),async(req,res)=>{const {name,email,password,specialization,department}=req.body;if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});const user=await User.create({name,email,password:await bcrypt.hash(password||'Doctor@123',10),role:'doctor'});res.status(201).json(await Doctor.create({user:user._id,specialization,department}));});
app.post('/api/admin/departments',auth,allow('admin'),async(req,res)=>res.status(201).json(await Department.create({name:req.body.name})));
app.get('/api/admin/stats',auth,allow('admin'),async(req,res)=>{const today=new Date();today.setHours(0,0,0,0);const [patients,doctors,departments,appointments,completed,revenue,statuses]=await Promise.all([Patient.countDocuments(),Doctor.countDocuments(),Department.countDocuments(),Appointment.countDocuments({date:{$gte:today}}),Appointment.countDocuments({status:'completed'}),Appointment.countDocuments({paymentStatus:'Paid'}),Appointment.aggregate([{$group:{_id:'$status',count:{$sum:1}}}])]);res.json({patients,doctors,departments,appointments,completed,revenue:revenue*500,statuses});});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Server error'});});
await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/hospital_management');
app.listen(port,()=>console.log(`API running on http://localhost:${port}`));
