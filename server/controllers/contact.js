const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const getMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(messages);
});

const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    throw new AppError("Please enter your name", 400);
  }
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new AppError("Please enter a valid email address", 400);
  }
  if (!subject || String(subject).trim().length < 2) {
    throw new AppError("Please enter a subject", 400);
  }
  if (!message || String(message).trim().length < 10) {
    throw new AppError("Message must be at least 10 characters", 400);
  }

  const saved = await prisma.contactMessage.create({
    data: {
      name: String(name).trim().slice(0, 100),
      email: cleanEmail.slice(0, 150),
      subject: String(subject).trim().slice(0, 150),
      message: String(message).trim().slice(0, 3000),
      status: "NEW",
    },
  });

  return res.status(201).json({
    message: "Thank you for contacting us! Our support team will reply within 24 hours.",
    ticket: saved,
  });
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ["NEW", "IN_PROGRESS", "RESOLVED"];
  if (!allowed.includes(status)) {
    throw new AppError("Invalid status value", 400);
  }
  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
  return res.json(updated);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.contactMessage.deleteMany({ where: { id } });
  return res.status(204).send();
});

module.exports = {
  getMessages,
  createMessage,
  updateMessageStatus,
  deleteMessage,
};
