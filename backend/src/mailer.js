import nodemailer from 'nodemailer';
let transporter=null;
if(process.env.SMTP_HOST&&process.env.SMTP_USER){transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})}
export async function sendMail(to,subject,text){if(!transporter)return false;try{await transporter.sendMail({from:process.env.SMTP_FROM,to,subject,text});return true}catch(e){console.error('Email failed:',e.message);return false}}
