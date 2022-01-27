import { Dispatch, FC, SetStateAction, useContext, useState } from 'react';

import axios from 'axios';

import useSpinner from 'common/hooks/useSpinner';
import { userContext } from 'common/context/userContext';

import { Flex } from 'common/components/Flex';
import { Button } from 'common/components/Button';
import { Header4 } from 'common/components/Headers';
import { AvatarSmall } from 'common/components/Avatars';
import { AvatarContainer, Container } from './AvatarPicker.elements';

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
      <Container>
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
            <label htmlFor="file1">
              <Header4 tabIndex={0}>Click to select image</Header4>
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
            <AvatarContainer>
              <AvatarSmall imageURL={URL.createObjectURL(image)} />
              {!group && (
                <Button type="submit" inputSize>
                  Upload
                </Button>
              )}
            </AvatarContainer>
          )}
        </form>
      </Container>
    </>
  );
};

export default AvatarPicker;
