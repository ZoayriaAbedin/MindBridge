const express = require('express');
const router = express.Router();
const supportGroupController = require('../controllers/supportGroup.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateSupportGroup, validateId } = require('../middleware/validation.middleware');

// Public route (anyone can view groups)
router.get('/', supportGroupController.getSupportGroups);
router.get('/:id', validateId, supportGroupController.getSupportGroup);

// Protected routes
router.use(verifyToken);

// Get user's groups
router.get('/my/groups', supportGroupController.getMyGroups);

// Create support group (doctors and admins only)
router.post('/', authorize('doctor', 'admin'), validateSupportGroup, supportGroupController.createSupportGroup);

// Update support group
router.put('/:id', validateId, supportGroupController.updateSupportGroup);

// Join/leave support group
router.post('/:id/join', validateId, supportGroupController.joinSupportGroup);
router.post('/:id/leave', validateId, supportGroupController.leaveSupportGroup);

module.exports = router;
