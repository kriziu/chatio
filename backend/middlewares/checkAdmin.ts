import connectionModel from 'backend/models/connection.model';
import { NextApiRequest } from 'next';
import getUserId from './getUserId';

const checkAdmin = async (req: NextApiRequest, connectionId: string) => {
  const _id = getUserId(req);

  try {
    const connection = await connectionModel.findOne({
      _id: connectionId,
      group: true,
    });

    if (!connection) return null;

    if (connection.admins?.includes(_id)) return connection;
    return null;
  } catch (err) {
    return null;
  }
};

export default checkAdmin;
