import express from 'express';
import { deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, registerUser, resetPassword, updatePassword, updateProfile, updateUserRole, verifyUser } from '../controllers/user.js';
import { loginValidators, registerValidators, validateHandler } from '../libs/validators.js';
import { singleAvatar } from '../middlewares/multer.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const app = express.Router();

app.post('/register', registerValidators(), validateHandler, registerUser)
app.post('/login', loginValidators(), validateHandler, login);
app.post('/verify', verifyUser);
app.post('/forgetpassword', forgetPassword);
app.post('/updatepassword', updatePassword);

app.use(isAuthenticated);

app.get('/me', getMyProfile)
app.put('/updateprofile', singleAvatar, updateProfile)
app.get('/logout', logout)
app.put('/resetpassword', resetPassword)

app.use(authorizeAdmin)

app.get('/admin/users', getAllUsers)
app.route('/admin/users/:id')
    .put(updateUserRole)
    .delete(deleteUser)

export default app;