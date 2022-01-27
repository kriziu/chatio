import { Dispatch, SetStateAction, useState } from 'react';

import { BigSpinner } from 'common/components/Spinner';

const useSpinner = (): [
  () => JSX.Element,
  Dispatch<SetStateAction<boolean>>
] => {
  const [loading, setLoading] = useState(false);

  const RenderSpinner = () => <BigSpinner loading={loading} />;

  return [RenderSpinner, setLoading];
};

export default useSpinner;
