export const jobs = {
    farmer: {
        name: 'Farmer',
        baseSalary: 3000,
        requiredItems: ['Tractor', 'Seeds Pack'],
        bonusPerItem: 500,
        description: 'Work the fields and harvest crops',
        workCooldown: 12 // hours
    },
    engineer: {
        name: 'Engineer',
        baseSalary: 5000,
        requiredItems: ['Advanced Laptop', 'CAD Software'],
        bonusPerItem: 1000,
        description: 'Design and develop technical solutions',
        workCooldown: 24
    },
    doctor: {
        name: 'Doctor',
        baseSalary: 7000,
        requiredItems: ['Medical Kit', 'Stethoscope'],
        bonusPerItem: 1500,
        description: 'Treat patients and save lives',
        workCooldown: 24
    },
    teacher: {
        name: 'Teacher',
        baseSalary: 4000,
        requiredItems: ['Teaching Materials', 'Smart Board'],
        bonusPerItem: 750,
        description: 'Educate and inspire students',
        workCooldown: 12
    },
    artist: {
        name: 'Artist',
        baseSalary: 3500,
        requiredItems: ['Professional Camera', 'Art Supplies Set'],
        bonusPerItem: 850,
        description: 'Create and sell artwork',
        workCooldown: 8
    }
};

export default {
    name: 'jobs',
    description: 'View available jobs',
    category: 'jobs',
    data: {
        name: 'jobs',
        description: 'View available jobs'
    },
    jobs
};
