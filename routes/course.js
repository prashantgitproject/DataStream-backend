import express from 'express';
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from '../controllers/course.js';
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from '../middlewares/auth.js';
import { singleAvatar } from '../middlewares/multer.js';

const app = express.Router();

app.get('/courses', getAllCourses)

app.use(isAuthenticated);

app.post('/createcourse', authorizeAdmin, singleAvatar, createCourse)

app.route('/courses/:id')
    .get(authorizeSubscribers, getCourseLectures)
    .put(authorizeAdmin, singleAvatar, addLecture)
    .delete(authorizeAdmin, deleteCourse)

app.delete('/lecture', authorizeAdmin, deleteLecture)

export default app;