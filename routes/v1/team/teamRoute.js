import express from "express";
import {
  inviteTeamMember,
  addTeamMember,
  listTeamMembers,
  editTeamMember,
  deleteTeamMember,
  getTeamMemberById,
} from "../../../controllers/team/teamController.js";


const router = express.Router();

// Invite a new team member
router.post("/invite", inviteTeamMember);

// Add a new team member
router.post("/add", addTeamMember);

// List all team members
router.get("/get/all", listTeamMembers);

// Get a team member by ID
router.get("/:id", getTeamMemberById);

// Edit a team member
router.put("/edit/:id", editTeamMember);

// Delete a team member
router.delete("/delete/:id", deleteTeamMember);



// router.put('/ad/status/admin/:adId', changeAdStatusForAdmin);

export default router;
