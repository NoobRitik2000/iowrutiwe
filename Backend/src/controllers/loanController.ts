import { Request, Response } from 'express';
import Transaction, { Loan, LoanAttributes } from '../models/loanModel';
import { Book } from '../models/bookModel';

// Create a new transaction (borrow a book)
export const borrowBook = async (req: Request, res: Response) => {
    const { book_id, user_id, borrow_date, due_date }: LoanAttributes = req.body;
    // console.log(req.body);
    
   // Input validation
   if (!book_id || !user_id || !borrow_date || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
}
    try {
        const transaction = await Transaction.create({
            book_id,
            user_id,
            borrow_date,
            due_date,
            status: 'borrowed',
            fine_amount: 0.00 // Initial fine amount
        });
        return res.status(201).json(transaction);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to borrow book', details: error });
    }
};
// Return a book
export const returnBook = async (req: Request, res: Response) => {
    // Destructure required fields from req.body
    const { loan_id, return_date, fine_amount } = req.body;  

    // Optional: Validate input data here

    try {
        // Find the transaction by its ID
        const loan = await Loan.findByPk(loan_id);

        if (!loan) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update transaction details
        loan.return_date = return_date; // Set the return date
        loan.status = 'returned'; // Update status to 'returned'
        loan.fine_amount = fine_amount; // Update the fine amount if applicable

        // Save the updated transaction
        await loan.save();

        // Respond with the updated transaction
        return res.status(200).json(loan);
    } catch (error) {
        console.error('Error returning book:', error); // Log the error for debugging
        return res.status(500).json({error: 'Failed to return book'});
    }
};


// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await Transaction.findAll();
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch transactions', details: error });
    }
};

// Get transactions for a specific user
export const getUserTransactions = async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: { user_id }
        });
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user transactions', details: error });
    }
};

// Get a specific transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
    const { transaction_id } = req.params;

    try {
        const transaction = await Transaction.findByPk(transaction_id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        return res.status(200).json(transaction);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch transaction', details: error });
    }
};
