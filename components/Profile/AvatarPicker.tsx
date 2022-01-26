import { Dispatch, FC, SetStateAction, useContext, useState } from 'react';

import axios from 'axios';

import useSpinner from 'hooks/useSpinner';
import { userContext } from 'context/userContext';

import { Flex } from 'components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import { Header4 } from 'components/Simple/Headers';
import { Avatar } from 'components/Simple/Avatars';

interface Props {
  group?: boolean;
  setImageUp?: Dispatch<SetStateAction<File | undefined>>;
}

const AvatarPicker: FC<Props> = ({ group, setImageUp }) => {
  const { setUser } = useContext(userContext);

  const [image, setImage] = useState<File>();

  const [RenderSpinner, setLoading] = useSpinner();

  return (
    <>
      <RenderSpinner />
      <div style={{ marginBottom: '2rem' }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!image || group) return;

            const body = new FormData();
            body.append('image', image);
            setLoading(true);

            axios
              .post<{ url: string }>('/api/profile/image', body)
              .then(res => {
                setUser(prev => {
                  return { ...prev, imageURL: res.data.url };
                });
                setLoading(false);
              });
          }}
        >
          <Flex>
            <label
              htmlFor="file1"
              style={{ marginTop: '1rem', cursor: 'pointer' }}
            >
              <Header4>Click to select image</Header4>
            </label>
            <input
              id="file1"
              type="file"
              accept=".jpg, .png, .jpeg"
              onChange={e => {
                if (e.target.files) {
                  setImage(e.target.files[0]);
                  setImageUp && setImageUp(e.target.files[0]);
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
              <Avatar imageURL={URL.createObjectURL(image)} unoptimized />
              {!group && (
                <Button type="submit" inputSize>
                  Upload
                </Button>
              )}
            </Flex>
          )}
        </form>
      </div>
    </>
  );
};

export default AvatarPicker;
