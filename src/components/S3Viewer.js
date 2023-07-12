import React, { useState,useContext,useEffect } from 'react'
import AWS from 'aws-sdk';
import CardImageS3 from './CardImageS3';
import { PageContext } from '../App';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  sessionToken:process.env.REACT_APP_AWS_SESSION_TOKEN
});

export const S3Viewer = ({ showImages, showMessage }) => {
  const [listFiles, setListFiles] = useState([]);
  const [s3Domain, setS3Domain] = useState("");
  const { setPage } = useContext(PageContext);

  const s3 = new AWS.S3();

  const getFromS3 = (e) => {
    const params = {
      Bucket: 'album-maker-carlos'
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
        setS3Domain(data.Name);
        setListFiles(data.Contents);
      }
    });
  }

  useEffect(() => {
    getFromS3();
  }, [])

  const formatUrl = (name) => {
    const url = "https://" + s3Domain + ".s3.amazonaws.com/" + name.replaceAll(" ", "+");
    return url;
  }

  const deleteFromS3 = (key) => {
    const params = {
      Bucket: 'album-maker-carlos',
      Key: key
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack, key);
      } else {
        console.log("Imagen eliminada con éxito:", key);
        // Actualizar la lista de archivos después de eliminar la imagen
        setListFiles(prevList => prevList.filter(file => file.Key !== key));
      }
    });
  }

  return (
    <div className='dark:bg-slate-900 dark:text-white'> 
      {showMessage && (<div className="grid  grid-col-1 justify-center">
        <div className='text-center'>
          Tienes un total de {listFiles.length} imagenes, el cual tiene un costo de {listFiles.length * 2.5}
        </div>
        {listFiles && listFiles.length > 0 && (
          <div className=" ">
            <ul className='text-center'>
              {listFiles.map((name, index) => (
                <li>
                  {name.Key}
                </li>
              ))}
            </ul>

          </div>
        )}
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-8"
          onClick={()=>{setPage(3)}}
        >
          Continuar
        </button>
      </div>
      )
      }

      {showImages && (<div className="flex justify-center mt-4 mx-4">
        {listFiles && listFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ">
            {listFiles.map((name, index) => (
              <CardImageS3
                key={index}
                imageDataURL={formatUrl(name.Key)}
                deleteFromS3={deleteFromS3}
                imageKey={name.Key}
              >
              </CardImageS3>
            ))}
          </div>
        )}
      </div>
      )};
    </div>
  )
}
