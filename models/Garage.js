
    staff: [{
        type: String,
        skill: Number,
        salary: Number
    }]
});

module.exports = mongoose.model('Garage', garageSchema);