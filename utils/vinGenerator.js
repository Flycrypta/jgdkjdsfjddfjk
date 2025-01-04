export function generateVIN() {
    // VIN format: WMI (3) + VDS (6) + VIS (8)
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    const wmi = 'JTS'; // Example manufacturer code
    let vin = wmi;
    
    // Generate 6 chars for Vehicle Descriptor Section
    for(let i = 0; i < 6; i++) {
        vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Add production year identifier (1 char)
    vin += String.fromCharCode(65 + new Date().getFullYear() - 2020);
    
    // Generate remaining 7 chars for Vehicle Identifier Section
    for(let i = 0; i < 7; i++) {
        vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return vin;
}
