// controllers/cattleController.js

const Employee = require('../Models/EmployeeModel');

const cattleController = {
    // Search for cattle by names
    searchCattle: async (req, res) => {
        try {
            const { names } = req.body;
            if (!Array.isArray(names)) {
                return res.status(400).json({ message: 'Names must be an array' });
            }

            const cattle = await Employee.find({
                name: { $in: names.map(name => new RegExp(`^${name}$`, 'i')) }
            });

            return res.status(200).json({
                success: true,
                data: cattle
            });
        } catch (error) {
            console.error('Search error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error searching cattle',
                error: error.message
            });
        }
    },

    // Update production data
    updateProduction: async (req, res) => {
        try {
            const { cattleId, production } = req.body;

            if (!cattleId || !production || !production.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            const cattle = await Employee.findById(cattleId);
            
            if (!cattle) {
                return res.status(404).json({
                    success: false,
                    message: 'Cattle not found'
                });
            }

            cattle.production.push({
                date: production.date || new Date(),
                amount: production.amount
            });
            
            cattle.updatedAt = new Date();
            await cattle.save();

            return res.status(200).json({
                success: true,
                message: 'Production updated successfully',
                data: cattle
            });
        } catch (error) {
            console.error('Update error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating production',
                error: error.message
            });
        }
    },

    // Get production history for a specific cattle
    getProductionHistory: async (req, res) => {
        try {
            const { cattleId } = req.params;
            
            const cattle = await Employee.findById(cattleId);
            
            if (!cattle) {
                return res.status(404).json({
                    success: false,
                    message: 'Cattle not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: cattle.production
            });
        } catch (error) {
            console.error('History fetch error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching production history',
                error: error.message
            });
        }
    },

    // Batch update production
    batchUpdateProduction: async (req, res) => {
        try {
            const { updates } = req.body;
            
            if (!Array.isArray(updates)) {
                return res.status(400).json({
                    success: false,
                    message: 'Updates must be an array'
                });
            }

            const results = await Promise.all(
                updates.map(async ({ cattleId, amount }) => {
                    try {
                        const cattle = await Employee.findById(cattleId);
                        if (!cattle) return { cattleId, success: false, message: 'Cattle not found' };

                        cattle.production.push({
                            date: new Date(),
                            amount
                        });
                        cattle.updatedAt = new Date();
                        await cattle.save();
                        
                        return { cattleId, success: true };
                    } catch (err) {
                        return { cattleId, success: false, message: err.message };
                    }
                })
            );

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Batch update error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error in batch update',
                error: error.message
            });
        }
    }
};

module.exports = cattleController;