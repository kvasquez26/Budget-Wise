import { ObjectId } from 'mongodb';
import { budgets } from '../config/mongoCollections.js';

//To validate ObjectId strings
const validateId = (id, varName) => {
    if(!id) throw new Error(`${varName} is required`);
    if (typeof id !== 'string') throw new Error(`${varName} must be a string`);
    id = id.trim();
    if (id.length === 0) throw new Error(`${varName} cannot be an empty string`);
    if (!ObjectId.isValid(id)) throw new Error(`${varName} is not a valid ObjectId`);
    return id;
};

const validateNonNegativeNumber = (value, varName) => {
    if (value === undefined || value === null) {
        throw new Error(`${varName} is required`);
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
        throw new Error(`${varName} must be a number`);
    }

    if (num < 0) {
        throw new Error(`${varName} must be a non-negative number`);
    }

    return num;
}

//Core Feature
//Create or update a budget record for a user. One budget per user
export const createOrUpdateBudget = async (userId, totalBudget) => {
    userId = validateId(userId, 'userId');
    const parsedBudget = validateNonNegativeNumber(totalBudget, 'totalBudget');

    const budgetsCollection = await budgets();

    const existing = await budgetsCollection.findOne({
        userId: new ObjectId(userId)
    });

    let dbResult;

    if (existing) {
        const updateInfo = await budgetsCollection.updateOne(
            { _id: existing._id },
            { $set: { totalBudget: parsedBudget } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
            throw new Error('Could not update budget successfully');
        }

        dbResult = await budgetsCollection.findOne({ _id: existing._id });
    } else {

        const newBudget = {
            userId: new ObjectId(userId),
            totalBudget: parsedBudget
        };

        const insertInfo = await budgetsCollection.insertOne(newBudget);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw new Error('Could not create budget successfully');
        }

        dbResult = await budgetsCollection.findOne({ _id: insertInfo.insertedId });
    }

    dbResult._id = dbResult._id.toString();
    dbResult.userId = dbResult.userId.toString();
    return dbResult;

};

//GET a budget document for a user if it exists
export const getBudgetForUser = async (userId) => {
    userId = validateId(userId, 'userId');

    const budgetsCollection = await budgets();

    const budget = await budgetsCollection.findOne({
        userId: new ObjectId(userId)
    });

    if (!budget) return null;

    budget._id = budget._id.toString();
    budget.userId = budget.userId.toString();
    return budget;
};

//DELETE a user's budget
export const deleteBudgetForUser = async (userId) => {
    userId = validateId(userId, 'userId');

    const budgetsCollection = await budgets();

    const deletionInfo = await budgetsCollection.findOneAndDelete({
        userId: new ObjectId(userId)
    });

    if (!deletionInfo.value) {
        return false;
    }

    return true;
};