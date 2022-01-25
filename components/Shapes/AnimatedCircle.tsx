import { FC } from 'react';
import { Circle } from './Circle.elements';

const AnimatedCircle: FC<{
  radius: number;
  secondary?: boolean;
  position: { x: number; y: number };
}> = props => {
  const { position } = props;

  const x = [0, position.x > 50 ? 40 : -40, 0];
  const y = [0, position.y > 50 ? 50 : -50, 0];

  const duration = Math.round(Math.random() * 5 + 10);

  return (
    <Circle
      {...props}
      secondary={props.secondary ? 1 : 0}
      animate={{ x, y }}
      transition={{ ease: 'linear', duration, repeat: Infinity }}
    />
  );
};

export default AnimatedCircle;
