import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middlewares/connectDB';
import budgetModel from '../../models/budget.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const budgets = await budgetModel.find();
    res.status(200).json(budgets);
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

export default connectDB(handler);
