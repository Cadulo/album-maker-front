import AWS from 'aws-sdk';
import { useState,useContext } from 'react';
import { ImagesContext } from "../pages/Upload";
import Continue from "./Continue"

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
    sessionToken:process.env.REACT_APP_AWS_SESSION_TOKEN
  });

export const S3Uploader = () => {
    const s3 = new AWS.S3();
    const {images} = useContext(ImagesContext);
    const [imageUrl, setImageUrl] = useState(null);

    const uploadToS3 = async () => {
        await Promise.all(
            images.map(async (imageDataURL) => {
                const file = await fetch(imageDataURL)
                    .then((res) => res.blob())
                    .then((blob) => new File([blob], `image_${Date.now()}.jpg`, { type: blob.type }));

                const params = {
                    Bucket: 'album-maker-carlos',
                    Key: file.name,
                    Body: file,
                };

                const { Location } = await s3.upload(params).promise();
                setImageUrl(Location);
                console.log('Cargando a S3:', Location);
            })
        );
    };
    return (
        <div>
            <Continue uploadToS3={uploadToS3}></Continue>
        </div>
    );

}



