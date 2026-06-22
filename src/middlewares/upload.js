import { cloudinary } from "../lib/cloudinary.config.js"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

  const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures', // Change folder name as needed
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});
  
export const upload = multer({ storage });



