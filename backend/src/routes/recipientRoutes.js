const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  favoritesQuerySchema,
  upsertFavoriteRecipientSchema,
  favoriteRecipientParamSchema
} = require("../validators/recipientValidators");
const {
  listFavoriteRecipients,
  upsertFavoriteRecipient,
  deleteFavoriteRecipient
} = require("../services/recipientService");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/favorites",
  asyncHandler(async (req, res) => {
    const query = favoritesQuerySchema.parse(req.query);
    const favorites = await listFavoriteRecipients(req.user.id, query.limit);

    return res.json({
      success: true,
      data: favorites
    });
  })
);

router.post(
  "/favorites",
  asyncHandler(async (req, res) => {
    const payload = upsertFavoriteRecipientSchema.parse(req.body);
    const favorite = await upsertFavoriteRecipient({
      userId: req.user.id,
      recipientName: payload.recipientName,
      recipientIdentifier: payload.recipientIdentifier
    });

    return res.status(201).json({
      success: true,
      data: favorite
    });
  })
);

router.delete(
  "/favorites/:id",
  asyncHandler(async (req, res) => {
    const { id } = favoriteRecipientParamSchema.parse(req.params);
    const isDeleted = await deleteFavoriteRecipient({
      userId: req.user.id,
      favoriteId: id
    });

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        error: "Favorite recipient not found"
      });
    }

    return res.status(204).send();
  })
);

module.exports = router;
