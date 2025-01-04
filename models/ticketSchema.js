import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    subject: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: Date,
    messages: [{
        userId: String,
        content: String,
        timestamp: Date
    }]
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
