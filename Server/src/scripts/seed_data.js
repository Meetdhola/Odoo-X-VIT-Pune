import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import Expense from '../models/expense.model.js';
import ApprovalRule from '../models/approvalRule.model.js';
import ApprovalRequest from '../models/approvalRequest.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDB = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon_auth_db');
        console.log('Cleaning up existing data...');
        
        await User.deleteMany({});
        await Company.deleteMany({});
        await Expense.deleteMany({});
        await ApprovalRule.deleteMany({});
        await ApprovalRequest.deleteMany({});

        console.log('Seeding Company...');
        const company = await Company.create({
            name: 'ReimburseIQ Corp',
            country: 'India',
            currency: 'INR'
        });

        console.log('Seeding Users...');
        const pass = await bcrypt.hash('admin123', 10);
        const empPass = await bcrypt.hash('emp123', 10);

        // 1. Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@test.com',
            password: pass,
            role: 'Admin',
            companyId: company._id,
            isVerified: true
        });

        // 2. Managers
        const manager1 = await User.create({
            name: 'Aarav Manager',
            email: 'aarav@test.com',
            password: empPass,
            role: 'Manager',
            companyId: company._id,
            isVerified: true
        });

        const manager2 = await User.create({
            name: 'Isha Director',
            email: 'isha@test.com',
            password: empPass,
            role: 'Manager',
            companyId: company._id,
            isVerified: true
        });

        // 3. Employees
        const emp1 = await User.create({
            name: 'Rahul Employee',
            email: 'rahul@test.com',
            password: empPass,
            role: 'Employee',
            companyId: company._id,
            managerId: manager1._id,
            isVerified: true
        });

        const emp2 = await User.create({
            name: 'Priya Dev',
            email: 'priya@test.com',
            password: empPass,
            role: 'Employee',
            companyId: company._id,
            managerId: manager1._id,
            isVerified: true
        });

        const emp3 = await User.create({
            name: 'Vikram Sales',
            email: 'vikram@test.com',
            password: empPass,
            role: 'Employee',
            companyId: company._id,
            managerId: manager2._id,
            isVerified: true
        });

        console.log('Seeding Approval Rules...');
        // Default Rule: Sequential (Manager -> Admin)
        const rule1 = await ApprovalRule.create({
            company: company._id,
            name: 'Standard Operations Policy',
            conditionType: 'sequential',
            steps: [
                { sequence: 1, approver: manager1._id, approverRole: 'Manager' },
                { sequence: 2, approver: admin._id, approverRole: 'Admin' }
            ]
        });

        // Threshold Rule
        const rule2 = await ApprovalRule.create({
            company: company._id,
            name: 'High-Value Threshold',
            conditionType: 'percentage',
            percentageThreshold: 100,
            steps: [
                { sequence: 1, approver: manager2._id, approverRole: 'Manager' }
            ]
        });

        console.log('Seeding Expenses & Requests...');
        const expenses = [
            { desc: 'Office Supplies', amt: 1200, cat: 'Office Supplies', status: 'approved', user: emp1 },
            { desc: 'Travel to Client', amt: 4500, cat: 'Travel', status: 'pending', user: emp1 },
            { desc: 'Cloud Hosting Subscription', amt: 8900, cat: 'Software', status: 'pending', user: emp2 },
            { desc: 'Team Dinner', amt: 3200, cat: 'Food', status: 'rejected', user: emp3 },
            { desc: 'New Graphics Tablet', amt: 15000, cat: 'Office Supplies', status: 'approved', user: emp2 },
            { desc: 'Conference Tickets', amt: 25000, cat: 'Other', status: 'reimbursed', user: emp2 },
            { desc: 'Uber Ride', amt: 450, cat: 'Travel', status: 'approved', user: emp3 },
            { desc: 'Laptop Repair', amt: 5600, cat: 'Software', status: 'pending', user: emp1 }
        ];

        for (const exp of expenses) {
            const expense = await Expense.create({
                employee: exp.user._id,
                company: company._id,
                amount: exp.amt,
                currency: 'INR',
                category: exp.cat,
                description: exp.desc,
                status: exp.status,
                approvalRule: rule1._id,
                currentStep: exp.status === 'pending' ? 1 : 2
            });

            // Create requests for pending ones
            if (exp.status === 'pending') {
                await ApprovalRequest.create({
                    expense: expense._id,
                    approver: exp.user.managerId || manager1._id,
                    step: 1,
                    status: 'pending'
                });
            } else if (exp.status === 'approved' || exp.status === 'reimbursed') {
                await ApprovalRequest.create({
                    expense: expense._id,
                    approver: exp.user.managerId || manager1._id,
                    step: 1,
                    status: 'approved',
                    decidedAt: new Date()
                });
            }
        }

        console.log('--------------------------------------------------');
        console.log('SEEDING COMPLETE!');
        console.log('Admin: admin@test.com / admin123');
        console.log('Manager: aarav@test.com / emp123');
        console.log('Employee: rahul@test.com / emp123');
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
