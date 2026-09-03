import jwt from 'jsonwebtoken';
import {User} from './models.js';
export function sign(user){return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});}
export async function auth(req,res,next){try{const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)return res.status(401).json({message:'Authentication required'});const data=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(data.id);if(!req.user)return res.status(401).json({message:'User not found'});next()}catch(e){res.status(401).json({message:'Invalid or expired token'})}}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Access denied'});
