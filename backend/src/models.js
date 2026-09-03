import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, password:{type:String,required:true}, role:{type:String,enum:['patient','doctor','admin'],required:true}, phone:String, address:String
},{timestamps:true});

const patientSchema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true}, age:Number, gender:String, bloodGroup:String, emergencyContact:String, allergies:String});
const doctorSchema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true}, department:{type:mongoose.Schema.Types.ObjectId,ref:'Department'}, specialization:String, availableDays:[String], availableFrom:String, availableTo:String});
const departmentSchema = new mongoose.Schema({name:{type:String,unique:true,required:true}, description:String});
const appointmentSchema = new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient',required:true},doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},department:{type:mongoose.Schema.Types.ObjectId,ref:'Department',required:true},date:{type:Date,required:true},reason:String,status:{type:String,enum:['pending','confirmed','rescheduled','cancelled','completed'],default:'pending'},paymentStatus:{type:String,enum:['Pending','Paid','Refunded'],default:'Pending'},notes:String},{timestamps:true});
appointmentSchema.index({doctor:1,date:1,status:1});
const prescriptionSchema = new mongoose.Schema({appointment:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment',required:true},patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient',required:true},doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},diagnosis:String,medicines:[{name:String,dosage:String,duration:String}],instructions:String,followUpDate:Date,pdfPath:String},{timestamps:true});
const reportSchema = new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient',required:true},appointment:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment'},originalName:String,fileName:String,mimeType:String,path:String},{timestamps:true});
const notificationSchema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},message:String,type:String,read:{type:Boolean,default:false}},{timestamps:true});
export const User=mongoose.model('User',userSchema); export const Patient=mongoose.model('Patient',patientSchema); export const Doctor=mongoose.model('Doctor',doctorSchema); export const Department=mongoose.model('Department',departmentSchema); export const Appointment=mongoose.model('Appointment',appointmentSchema); export const Prescription=mongoose.model('Prescription',prescriptionSchema); export const Report=mongoose.model('Report',reportSchema); export const Notification=mongoose.model('Notification',notificationSchema);
