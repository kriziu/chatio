import { FC, useContext, useState } from 'react';

import axios from 'axios';

import { userContext } from 'context/userContext';
import { Img } from './AvatarPicker.elements';
import { Flex } from 'components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import { Header4 } from 'components/Simple/Headers';
import Spinner from 'components/Spinner';

const AvatarPicker: FC = () => {
  const { setUser } = useContext(userContext);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File>();

  return (
    <div style={{ marginBottom: '2rem' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'black',
            top: 0,
            opacity: 0.5,
            width: '100%',
            height: '100%',
            zIndex: 999,
          }}
        >
          <Spinner />
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!image) return;

          const body = new FormData();
          body.append('image', image);
          setLoading(true);
          axios.post<{ url: string }>('/api/profile/image', body).then(res => {
            setUser(prev => {
              return { ...prev, imageURL: res.data.url };
            });
            setLoading(false);
          });
        }}
      >
        <Flex>
          <label htmlFor="file1" style={{ marginTop: '2rem' }}>
            <Header4>Click to select file</Header4>
          </label>
          <input
            id="file1"
            type="file"
            accept=".jpg, .png, .jpeg"
            onChange={e => {
              if (e.target.files) {
                setImage(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />
        </Flex>
        {image && (
          <Flex
            style={{
              flexDirection: 'column',
              height: '18vh',
              justifyContent: 'space-around',
            }}
          >
            <Img src={URL.createObjectURL(image)} width={75} height={75} />
            <Button type="submit" inputSize>
              Upload
            </Button>
          </Flex>
        )}
      </form>
    </div>
  );
};

export default AvatarPicker;
