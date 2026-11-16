const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(subscribers);
});

const subscribe = asyncHandler(async (req, res) => {
  const rawEmail = req.body?.email;
  if (!rawEmail || typeof rawEmail !== "string") {
    throw new AppError("Please enter a valid email address", 400);
  }
  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Please enter a valid email address", 400);
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });
  if (existing) {
    return res.status(200).json({
      message: "You're already subscribed! Use code SAVE10 for 10% off your next order.",
      alreadySubscribed: true,
      subscriber: existing,
    });
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email },
  });
  return res.status(201).json({
    message: "Subscribed! Welcome to Singitronic — use code SAVE10 for 10% off.",
    alreadySubscribed: false,
    subscriber,
  });
});

const deleteSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.newsletterSubscriber.deleteMany({ where: { id } });
  return res.status(204).send();
});

module.exports = { getSubscribers, subscribe, deleteSubscriber };
