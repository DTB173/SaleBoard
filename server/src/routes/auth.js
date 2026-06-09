import express from "express";
import { getAuth, createClerkClient } from "@clerk/express";
import { clerkClient } from "../config/clerk.js";

const router = express.Router();

router.post("/update-profile", async (req, res) => {
  const { userId } = getAuth(req);
  const { phone, address } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        phone: phone,
        address: address,
      },
    });

    res.json({ message: "Profile updated in Clerk", metadata: updatedUser.publicMetadata });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;