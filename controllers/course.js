import { TryCatch } from "../middlewares/error.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";
import { deleteFilesFromCloudinary, uploadFilesToCloudinary } from "../utils/features.js";
import { ErrorHandler } from "../utils/utlity.js";


export const getAllCourses = TryCatch(async (req, res, next) => {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
  
    const courses = await Course.find({
      title: {
        $regex: keyword,
        $options: "i",
      },
      category: {
        $regex: category,
        $options: "i",
      },
    }).select("-lectures");
    res.status(200).json({
      success: true,
      courses,
    });
  })


export const createCourse = TryCatch(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;
  
    if (!title || !description || !category || !createdBy)
      return next(new ErrorHandler("Please add all fields", 400));
  
    const file = req.file;

    if (!file) return next(new ErrorHandler("Please Upload Poster Image", 400));
  
    const result = await uploadFilesToCloudinary([file], "poster"); 

    const poster = {
        public_id: result[0].public_id,
        url: result[0].url,
    }
  
    await Course.create({
      title,
      description,
      category,
      createdBy,
      poster,
    });

    res.status(201).json({
        success: true,
        message: "Course Created Successfully. You can add lectures now.",
      });
});


export const getCourseLectures = TryCatch(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    
    if (!course) return next(new ErrorHandler("Course not found", 404));
    
    course.views += 1;
    
    await course.save();
    
    res.status(200).json({
        success: true,
        lectures: course.lectures,
    });
});


// Max video size 100mb
export const addLecture = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(id);

    if (!course) return next(new ErrorHandler("Course not found", 404));

    const file = req.file;

    if (!file) return next(new ErrorHandler("Please Upload video lecture", 400));

    const result = await uploadFilesToCloudinary([file], "lecture", "video"); 

    const video = {
        public_id: result[0].public_id,
        url: result[0].url,
    }

    course.lectures.push({
        title,
        description,
        video,
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture added in Course",
    });
});


export const deleteCourse = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const course = await Course.findById(id);
  
    if (!course) return next(new ErrorHandler("Course not found", 404));
  
    await deleteFilesFromCloudinary([course.poster.public_id])

    await deleteFilesFromCloudinary(course.lectures.map((lecture) => lecture.video.public_id));
  
    await course.deleteOne();
    // await course.remove();
  
    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
});

export const deleteLecture = TryCatch(async (req, res, next) => {
    const { courseId, lectureId } = req.query;
  
    const course = await Course.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));
  
    const lecture = course.lectures.find((item) => {
      if (item._id.toString() === lectureId.toString()) return item;
    });

    await deleteFilesFromCloudinary([lecture.video.public_id]);
  
    course.lectures = course.lectures.filter((item) => {
      if (item._id.toString() !== lectureId.toString()) return item;
    });
  
    course.numOfVideos = course.lectures.length;
  
    await course.save();
  
    res.status(200).json({
      success: true,
      message: "Lecture Deleted Successfully",
    });
});

Course.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  
    const courses = await Course.find({});
  
    let totalViews = 0;
  
    for (let i = 0; i < courses.length; i++) {
      totalViews += courses[i].views;
    }
    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());
  
    await stats[0].save();
  });


