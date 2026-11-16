const prisma = require("../utills/db");
const { validateOrderData, ValidationError } = require("../utills/validation");
const { createOrderUpdateNotification } = require("../utills/notificationHelpers");

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "canceled"];

async function createCustomerOrder(request, response) {
  try {
    if (!request.body || typeof request.body !== "object") {
      return response.status(400).json({
        error: "Invalid request body",
        details: "Request body must be a valid JSON object",
      });
    }

    const validation = validateOrderData(request.body);
    if (!validation.isValid) {
      return response.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    const validatedData = validation.validatedData;
    if (validatedData.total < 1) {
      return response.status(400).json({
        error: "Invalid order total",
        details: [{ field: "total", message: "Order total must be at least $1" }],
      });
    }

    const corder = await prisma.customer_order.create({
      data: {
        name: validatedData.name,
        lastname: validatedData.lastname,
        phone: validatedData.phone,
        email: validatedData.email,
        company: validatedData.company || "",
        adress: validatedData.adress,
        apartment: validatedData.apartment || "",
        postalCode: validatedData.postalCode,
        status: validatedData.status || "processing",
        city: validatedData.city,
        country: validatedData.country,
        orderNotice: validatedData.orderNotice || null,
        total: Math.round(validatedData.total),
        dateTime: new Date(),
      },
    });

    try {
      let user = null;
      if (request.body.userId) {
        user = await prisma.user.findUnique({ where: { id: request.body.userId } });
      }
      if (!user) {
        user = await prisma.user.findUnique({ where: { email: validatedData.email } });
      }
      if (user) {
        await createOrderUpdateNotification(
          user.id,
          "confirmed",
          corder.id,
          corder.total
        );
      }
    } catch (notificationError) {
      console.error("Notification creation skipped:", notificationError.message);
    }

    return response.status(201).json(corder);
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof ValidationError) {
      return response.status(400).json({
        error: "Validation failed",
        details: [{ field: error.field, message: error.message }],
      });
    }
    return response.status(500).json({
      error: "Internal server error",
      details: "Failed to create order. Please try again later.",
    });
  }
}

async function updateCustomerOrder(request, response) {
  try {
    const { id } = request.params;
    if (!id) {
      return response.status(400).json({ error: "Order ID is required" });
    }

    const existingOrder = await prisma.customer_order.findUnique({ where: { id } });
    if (!existingOrder) {
      return response.status(404).json({ error: "Order not found" });
    }

    const body = request.body || {};

    // Helper: sync product stock when transitioning into or out of cancelled status
    const syncStockForStatusTransition = async (prevStatus, nextStatus) => {
      const wasCancelled =
        prevStatus === "cancelled" || prevStatus === "canceled";
      const isCancelled =
        nextStatus === "cancelled" || nextStatus === "canceled";
      if (wasCancelled === isCancelled) return;

      const lineItems = await prisma.customer_order_product.findMany({
        where: { customerOrderId: id },
      });
      for (const item of lineItems) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!prod) continue;
        if (isCancelled) {
          // Order cancelled -> restore stock
          await prisma.product.update({
            where: { id: prod.id },
            data: { inStock: prod.inStock + item.quantity },
          });
        } else {
          // Order reactivated -> re-deduct available stock safely
          await prisma.product.update({
            where: { id: prod.id },
            data: { inStock: Math.max(0, prod.inStock - item.quantity) },
          });
        }
      }
    };

    // Support quick status-only update from Admin Orders table or Customer cancel
    const bodyKeys = Object.keys(body);
    if (bodyKeys.length === 1 && bodyKeys[0] === "status") {
      const rawStatus = String(body.status || "").toLowerCase();
      if (!VALID_STATUSES.includes(rawStatus)) {
        return response.status(400).json({ error: "Invalid order status" });
      }
      const normalizedStatus = rawStatus === "canceled" ? "cancelled" : rawStatus;
      const updated = await prisma.customer_order.update({
        where: { id },
        data: { status: normalizedStatus },
      });

      await syncStockForStatusTransition(existingOrder.status, normalizedStatus);

      if (existingOrder.status !== normalizedStatus) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: existingOrder.email },
          });
          if (user) {
            await createOrderUpdateNotification(
              user.id,
              normalizedStatus,
              updated.id,
              updated.total
            );
          }
        } catch (_) {}
      }

      return response.status(200).json(updated);
    }

    // Merge with existing order so partial updates also validate cleanly
    const merged = {
      name: body.name ?? existingOrder.name,
      lastname: body.lastname ?? existingOrder.lastname,
      phone: body.phone ?? existingOrder.phone,
      email: body.email ?? existingOrder.email,
      company: body.company ?? existingOrder.company ?? "",
      adress: body.adress ?? existingOrder.adress,
      apartment: body.apartment ?? existingOrder.apartment ?? "",
      postalCode: body.postalCode ?? existingOrder.postalCode,
      city: body.city ?? existingOrder.city,
      country: body.country ?? existingOrder.country,
      orderNotice: body.orderNotice ?? existingOrder.orderNotice ?? "",
      status: body.status ?? existingOrder.status,
      total: body.total ?? existingOrder.total,
    };

    const validation = validateOrderData(merged);
    if (!validation.isValid) {
      return response.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    const v = validation.validatedData;
    const updatedOrder = await prisma.customer_order.update({
      where: { id },
      data: {
        name: v.name,
        lastname: v.lastname,
        phone: v.phone,
        email: v.email,
        company: v.company || "",
        adress: v.adress,
        apartment: v.apartment || "",
        postalCode: v.postalCode,
        status: v.status,
        city: v.city,
        country: v.country,
        orderNotice: v.orderNotice || null,
        total: Math.round(v.total),
      },
    });

    if (existingOrder.status !== updatedOrder.status) {
      await syncStockForStatusTransition(existingOrder.status, updatedOrder.status);
      try {
        const user = await prisma.user.findUnique({
          where: { email: updatedOrder.email },
        });
        if (user) {
          await createOrderUpdateNotification(
            user.id,
            updatedOrder.status,
            updatedOrder.id,
            updatedOrder.total
          );
        }
      } catch (_) {}
    }

    return response.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return response.status(500).json({ error: "Failed to update order" });
  }
}

async function deleteCustomerOrder(request, response) {
  try {
    const { id } = request.params;
    if (!id) {
      return response.status(400).json({ error: "Order ID is required" });
    }

    const existingOrder = await prisma.customer_order.findUnique({ where: { id } });
    if (!existingOrder) {
      return response.status(404).json({ error: "Order not found" });
    }

    await prisma.customer_order_product.deleteMany({
      where: { customerOrderId: id },
    });
    await prisma.customer_order.delete({ where: { id } });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    return response.status(500).json({ error: "Failed to delete order" });
  }
}

async function getCustomerOrder(request, response) {
  try {
    const { id } = request.params;
    if (!id) {
      return response.status(400).json({ error: "Order ID is required" });
    }

    const order = await prisma.customer_order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return response.status(404).json({ error: "Order not found" });
    }

    return response.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return response.status(500).json({ error: "Failed to fetch order" });
  }
}

async function getAllOrders(request, response) {
  try {
    const page = Math.max(1, parseInt(request.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit, 10) || 50));
    const offset = (page - 1) * limit;
    const email = request.query.email ? String(request.query.email).trim().toLowerCase() : "";
    const status = request.query.status ? String(request.query.status).trim().toLowerCase() : "";
    const lookup = request.query.lookup ? String(request.query.lookup).trim() : "";

    const where = {};
    if (email) {
      where.email = email;
    }
    if (status && status !== "all") {
      where.status = status === "canceled" ? "cancelled" : status;
    }
    if (lookup) {
      where.OR = [
        { id: lookup },
        { id: { contains: lookup } },
        { email: lookup.toLowerCase() },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.customer_order.findMany({
        skip: offset,
        take: limit,
        where,
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  mainImage: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { dateTime: "desc" },
      }),
      prisma.customer_order.count({ where }),
    ]);

    return response.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return response.status(500).json({ error: "Failed to fetch orders" });
  }
}

module.exports = {
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getCustomerOrder,
  getAllOrders,
};
