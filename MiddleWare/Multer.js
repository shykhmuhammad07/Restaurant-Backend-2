import cloudinary from "../Config/Cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage ({
    cloudinary,
    params: {
        folder: "resturants",
    }
})

const upload = multer({storage});

export default upload;