import mongoose, { Schema, model } from "mongoose";


const schema = new Schema({ 
    title: {
        type: String,
        required: [true, "Please enter course title"],
      },
      description: {
        type: String,
        required: [true, "Please enter course title"],
      },
    
      lectures: [
        {
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          video: {
            public_id: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          },
        },
      ],
    
      poster: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      views: {
        type: Number,
        default: 0,
      },
      numOfVideos: {
        type: Number,
        default: 0,
      },
      category: {
        type: String,
        required: true,
      },
      createdBy: {
        type: String,
        required: [true, "Enter Course Creator Name"],
      },
}, {timestamps: true})

export const Course = mongoose.models.Course || model("Course", schema);